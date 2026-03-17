import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/** Binomial coefficient C(n, k) */
function C(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

/**
 * Base roll distribution — no rerolls applied here.
 * Relentless: reroll any dice once each (optimal = reroll all fails).
 *   Baked into effective probabilities: pc' = pc + pm·pc, ph' = ph + pm·ph
 * Ceaseless: handled separately via applyCeaselessTransform.
 */
function rollDistribution(n, pc, ph, relentless = false) {
  let effectivePc = pc;
  let effectivePh = ph;

  if (relentless) {
    const pm = 1 - pc - ph;
    effectivePc = pc + pm * pc;
    effectivePh = ph + pm * ph;
    // effectivePm = pm² (each fail rerolled once)
  }

  const pm = Math.max(0, 1 - effectivePc - effectivePh);

  // prob[c][h]
  const prob = Array.from({ length: n + 1 }, () => new Float64Array(n + 1));

  for (let c = 0; c <= n; c++) {
    for (let h = 0; h <= n - c; h++) {
      const m = n - c - h;
      prob[c][h] = C(n, c) * C(n - c, h)
        * Math.pow(effectivePc, c)
        * Math.pow(effectivePh, h)
        * Math.pow(pm, m);
    }
  }

  return prob;
}

/**
 * Ceaseless (RerollMostCommonFail): rerolls all dice showing one fail face —
 * the face that appeared the most times. For m fails on k distinct fail faces,
 * returns { r: probability } where r is the number of dice that get rerolled.
 *
 * Algorithm: enumerate all sorted partitions of m into k non-negative parts.
 * For each partition [d0≥d1≥…≥dk-1], the reroll count is d0 (the max).
 * Weight = multinomial(m; d0,…,dk-1) × (distinct arrangements of bucket labels).
 */
function getCeaselessRerollCountProbs(numFailFaces, numFails) {
  const k = numFailFaces;
  const m = numFails;
  if (m === 0 || k === 0) return { 0: 1.0 };

  const total = Math.pow(k, m);
  const accum = {};
  const buckets = new Array(k).fill(0);

  function enumerate(pos, remaining, maxVal) {
    if (pos === k - 1) {
      if (remaining > maxVal) return;
      buckets[pos] = remaining;
      // Multinomial: m! / (b0! * b1! * … * b_{k-1}!) computed via binomials
      let mult = 1, rem = m;
      for (let i = 0; i < k; i++) { mult *= C(rem, buckets[i]); rem -= buckets[i]; }
      // Distinct label permutations: k! / product(freq_of_each_value!)
      const freq = {};
      for (const v of buckets) freq[v] = (freq[v] || 0) + 1;
      let kFact = 1;
      for (let i = 1; i <= k; i++) kFact *= i;
      let permDenom = 1;
      for (const f of Object.values(freq)) { let fi = 1; for (let i = 1; i <= f; i++) fi *= i; permDenom *= fi; }
      mult *= kFact / permDenom;
      const r = buckets[0];
      accum[r] = (accum[r] || 0) + mult;
      return;
    }
    const minForThis = Math.ceil(remaining / (k - pos));
    for (let v = Math.min(maxVal, remaining); v >= minForThis; v--) {
      buckets[pos] = v;
      enumerate(pos + 1, remaining - v, v);
    }
  }

  enumerate(0, m, m);

  const result = {};
  for (const [r, cnt] of Object.entries(accum)) {
    result[Number(r)] = cnt / total;
  }
  return result;
}

/**
 * Applies the Ceaseless reroll transform to a (c,h) probability distribution.
 * numFailFaces = bs - 1 (die faces 1…bs-1 are misses).
 */
function applyCeaselessTransform(dist, n, pc, ph, numFailFaces) {
  const pm = Math.max(0, 1 - pc - ph);
  if (pm < 1e-12 || numFailFaces === 0) return dist;

  const newDist = Array.from({ length: n + 1 }, () => new Float64Array(n + 1));

  for (let c = 0; c <= n; c++) {
    for (let h = 0; h <= n - c; h++) {
      const p = dist[c][h];
      if (p < 1e-15) continue;
      const m = n - c - h;
      if (m === 0) { newDist[c][h] += p; continue; }

      const rerollProbs = getCeaselessRerollCountProbs(numFailFaces, m);

      for (const [rStr, pReroll] of Object.entries(rerollProbs)) {
        const r = Number(rStr);
        if (r === 0) { newDist[c][h] += p * pReroll; continue; }
        // Reroll r dice: each can become crit (pc), hit (ph), or fail (pm)
        for (let dc = 0; dc <= r; dc++) {
          for (let dh = 0; dh <= r - dc; dh++) {
            const pRoll = C(r, dc) * C(r - dc, dh)
              * Math.pow(pc, dc) * Math.pow(ph, dh) * Math.pow(pm, r - dc - dh);
            if (pRoll < 1e-15) continue;
            newDist[c + dc][h + dh] += p * pReroll * pRoll;
          }
        }
      }
    }
  }

  return newDist;
}

/**
 * KT24 save system: defender rolls d dice.
 * Crit save (≥ critSave): cancels any 1 hit (crit or normal).
 * Normal save (≥ save, < critSave): cancels 1 normal hit. Two normal saves cancel 1 crit.
 * Brutal: normal saves are disabled — only crit saves work.
 *
 * Optimal save assignment: tries both orderings (normals-first / crits-first for normal saves)
 * and picks whichever results in less damage.
 */
function applyOptimalSaves(crits, norms, cs, ns, dmgCrit, dmgNorm) {
  function calc(normSavesOnNormsFirst) {
    let rc = crits, rn = norms, rcs = cs, rns = ns;
    // Crit saves on crits first (always optimal since dmgCrit ≥ dmgNorm)
    const c1 = Math.min(rcs, rc); rc -= c1; rcs -= c1;
    if (normSavesOnNormsFirst) {
      // Normal saves cancel normals, leftover pairs cancel crits
      const n1 = Math.min(rns, rn); rn -= n1; rns -= n1;
      const c2 = Math.min(Math.floor(rns / 2), rc); rc -= c2;
    } else {
      // Normal saves trade 2:1 for crits first, leftover cancel normals
      const c2 = Math.min(Math.floor(rns / 2), rc); rc -= c2; rns -= c2 * 2;
      const n1 = Math.min(rns, rn); rn -= n1;
    }
    // Remaining crit saves cancel normals
    const n2 = Math.min(rcs, rn); rn -= n2;
    return rc * dmgCrit + rn * dmgNorm;
  }
  return Math.min(calc(true), calc(false));
}

/**
 * Main shooting calculator — KT24 correct save model.
 * Defender rolls defDice dice (reduced by piercing). Each die:
 *   ≥ critSave → crit save (cancels any hit)
 *   ≥ save     → normal save (cancels a normal hit; 2 normal saves cancel 1 crit)
 * Brutal: normal saves disabled.
 * Returns { avgDamage, killChance, distribution: [{totalDmg, prob}] }
 */
function calcShooting({
  attackDice, bs, lethalX, accurateX,
  dmgNorm, dmgCrit, ap, defDice,
  saveRoll, saveCritRoll, wounds,
  severe, rending, devastating, mw,
  brutal, ceaseless, relentless, punishing, puritySeal, balanced, normalToCrit, invulnSave,
}) {
  // Accurate X: these dice auto-succeed as normal hits, rest are rolled
  const autoHits   = clamp(accurateX || 0, 0, attackDice);
  const rolledDice = attackDice - autoHits;

  // Attack dice probabilities
  // Lethal X+: rolls ≥ X are crits; crit face count = 7 - lethalX (default: only 6 is crit → 1 face)
  const critFaces = lethalX > 0 ? clamp(7 - lethalX, 0, 6) : 1;
  const pc = critFaces / 6;
  const ph = Math.max(0, (7 - bs) / 6 - pc);

  let rawDist = rollDistribution(rolledDice, pc, ph, relentless);

  // Ceaseless: reroll all dice showing the most common fail face
  if (ceaseless) {
    const numFailFaces = Math.max(0, bs - 1);
    rawDist = applyCeaselessTransform(rawDist, rolledDice, pc, ph, numFailFaces);
  }

  // Balanced: re-roll exactly 1 failed die, accept new result (each die rerolled at most once)
  let dist = rawDist;
  if (balanced && rolledDice > 0) {
    const pmB = Math.max(0, 1 - pc - ph);
    const rerolled = Array.from({ length: rolledDice + 1 }, () => new Float64Array(rolledDice + 1));
    for (let c = 0; c <= rolledDice; c++) {
      for (let h = 0; h <= rolledDice - c; h++) {
        const m = rolledDice - c - h;
        const p = dist[c][h];
        if (p < 1e-15) continue;
        if (m >= 1) {
          rerolled[c + 1][h] += p * pc;
          rerolled[c][h + 1] += p * ph;
          rerolled[c][h]     += p * pmB;
        } else {
          rerolled[c][h] += p;
        }
      }
    }
    dist = rerolled;
  }

  // Purity Seal: if misses ≥ 2 → delete one miss, convert one to normal hit
  if (puritySeal && rolledDice > 0) {
    const transformed = Array.from({ length: rolledDice + 1 }, () => new Float64Array(rolledDice + 1));
    for (let c = 0; c <= rolledDice; c++) {
      for (let h = 0; h <= rolledDice - c; h++) {
        const m = rolledDice - c - h;
        const p = dist[c][h];
        if (p < 1e-15) continue;
        transformed[c][m >= 2 ? h + 1 : h] += p;
      }
    }
    dist = transformed;
  }

  // Defence dice after Piercing (Invulnerable Save ignores Piercing)
  const d = Math.max(0, defDice - (invulnSave ? 0 : ap));

  // Per-die save probabilities
  // rolls ≥ critSave → crit save; rolls ≥ save and < critSave → normal save; rest → fail
  const pCritSave = Math.max(0, (7 - saveCritRoll) / 6);
  const pNormSave = Math.max(0, (saveCritRoll - saveRoll) / 6);
  // pFailSave = 1 - pCritSave - pNormSave

  const dmgMap = new Map();

  for (let c = 0; c <= rolledDice; c++) {
    for (let h = 0; h <= rolledDice - c; h++) {
      const pAtk = dist[c][h];
      if (pAtk < 1e-15) continue;

      const fails = rolledDice - c - h;

      // Post-roll attacker modifiers
      let fc = c;
      let fh = h + autoHits;
      // h = rolled normals only (used for Rending eligibility — auto-hits don't count)

      // Punishing: if ≥1 crit retained and ≥1 fail, convert one fail → normal
      if (punishing && fc >= 1 && fails >= 1) fh += 1;

      // Severe: if 0 crits retained and ≥1 normal, convert one normal → crit
      if (severe && fc === 0 && fh >= 1) { fc += 1; fh -= 1; }

      // Rending: if ≥1 crit retained and ≥1 *rolled* normal, convert ONE → crit
      // (auto-hits from Accurate don't satisfy Rending's "HIT result" condition)
      if (rending && fc >= 1 && h >= 1) { fc += 1; fh -= 1; }

      // Normal to Crit: convert up to normalToCrit normals → crits
      if (normalToCrit > 0 && fh >= 1) {
        const convert = Math.min(normalToCrit, fh);
        fc += convert; fh -= convert;
      }

      // Devastating MWx: each crit deals mw immediate mortal wounds (unsaveable)
      // Crits STILL enter the save pool and surviving crits deal critDmg on top.
      const mortalWounds = devastating ? fc * mw : 0;
      const attackCrits = fc;

      // Iterate over all defender save dice outcomes (cs crit saves, ns normal saves)
      for (let cs = 0; cs <= d; cs++) {
        for (let ns = 0; ns <= d - cs; ns++) {
          const fs = d - cs - ns;
          const pSave = C(d, cs) * C(d - cs, ns)
            * Math.pow(pCritSave, cs)
            * Math.pow(pNormSave, ns)
            * Math.pow(1 - pCritSave - pNormSave, fs);
          if (pSave < 1e-15) continue;

          // Brutal: normal saves don't work — pass ns=0
          const nsEff = brutal ? 0 : ns;
          const dmg = mortalWounds + applyOptimalSaves(attackCrits, fh, cs, nsEff, dmgCrit, dmgNorm);
          const dmgKey = Math.round(dmg * 10) / 10;
          dmgMap.set(dmgKey, (dmgMap.get(dmgKey) || 0) + pAtk * pSave);
        }
      }
    }
  }

  let avgDamage = 0, killChance = 0;
  const distribution = [];
  for (const [dmg, prob] of dmgMap) {
    avgDamage += dmg * prob;
    if (dmg >= wounds) killChance += prob;
    distribution.push({ totalDmg: dmg, prob });
  }
  distribution.sort((a, b) => a.totalDmg - b.totalDmg);

  return { avgDamage, killChance, distribution };
}

/** Placeholder — fighting tab math to be implemented */
function computeDamage() { return 0; }

/**
 * Fighting calculator — simulates melee exchange.
 * Two fighters each roll their dice, apply strikes in order.
 * Returns damage dealt by attacker to defender per fight.
 */
function calcFighting({
  atkDice, ws,
  atkDmgNorm, atkDmgCrit, atkAp,
  defSave, defCritSave, defWounds,
  atkSevere, atkRending, atkDevastating, atkMw,
  atkCeaseless, atkRelentless,
  // Defender
  defDice, defWs,
  defDmgNorm, defDmgCrit, defAp,
  atkSave, atkCritSave, atkWounds,
  defSevere, defRending, defDevastating, defMw,
  defCeaseless, defRelentless,
  // Who strikes first
  firstStrike, // 'attacker' | 'defender'
}) {
  const critFaces = 1; // in melee, 6 is always crit
  const pc_atk = critFaces / 6;
  const ph_atk = Math.max(0, (7 - ws) / 6 - pc_atk);
  const pc_def = critFaces / 6;
  const ph_def = Math.max(0, (7 - defWs) / 6 - pc_def);

  const atkDist = rollDistribution(atkDice, pc_atk, ph_atk, atkRelentless);
  const defDist = rollDistribution(defDice, pc_def, ph_def, defRelentless);

  // For each combination, compute damage dealt by each side
  // Fighting is deterministic given rolls (no saving throws in melee? Actually in KT melee uses saves too)
  // We'll compute expected damage with saves included

  let atkAvgDmg = 0, defAvgDmg = 0;
  let atkKillChance = 0, defKillChance = 0;

  // Attacker damage distribution
  const atkDmgMap = new Map();
  for (let c = 0; c <= atkDice; c++) {
    for (let h = 0; h <= atkDice - c; h++) {
      const p = atkDist[c][h];
      if (p < 1e-15) continue;
      const dmg = computeDamage({
        c, h,
        dmgNorm: atkDmgNorm, dmgCrit: atkDmgCrit, ap: atkAp,
        saveRoll: defSave, saveCritRoll: defCritSave,
        severe: atkSevere, rending: atkRending,
        devastating: atkDevastating, mw: atkMw,
        brutal: false,
      });
      const key = Math.round(dmg * 10) / 10;
      atkDmgMap.set(key, (atkDmgMap.get(key) || 0) + p);
    }
  }

  const atkDist2 = [];
  for (const [dmg, prob] of atkDmgMap) {
    atkAvgDmg += dmg * prob;
    if (dmg >= defWounds) atkKillChance += prob;
    atkDist2.push({ totalDmg: dmg, prob });
  }
  atkDist2.sort((a, b) => a.totalDmg - b.totalDmg);

  // Defender damage distribution
  const defDmgMap = new Map();
  for (let c = 0; c <= defDice; c++) {
    for (let h = 0; h <= defDice - c; h++) {
      const p = defDist[c][h];
      if (p < 1e-15) continue;
      const dmg = computeDamage({
        c, h,
        dmgNorm: defDmgNorm, dmgCrit: defDmgCrit, ap: defAp,
        saveRoll: atkSave, saveCritRoll: atkCritSave,
        severe: defSevere, rending: defRending,
        devastating: defDevastating, mw: defMw,
        brutal: false,
      });
      const key = Math.round(dmg * 10) / 10;
      defDmgMap.set(key, (defDmgMap.get(key) || 0) + p);
    }
  }

  const defDist2 = [];
  for (const [dmg, prob] of defDmgMap) {
    defAvgDmg += dmg * prob;
    if (dmg >= atkWounds) defKillChance += prob;
    defDist2.push({ totalDmg: dmg, prob });
  }
  defDist2.sort((a, b) => a.totalDmg - b.totalDmg);

  return {
    attacker: { avgDamage: atkAvgDmg, killChance: atkKillChance, distribution: atkDist2 },
    defender: { avgDamage: defAvgDmg, killChance: defKillChance, distribution: defDist2 },
  };
}

// ── UI Components ─────────────────────────────────────────────────────────────

function Stepper({ label, value, onChange, min = 1, max = 20 }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#7a7a8a] text-xs">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(clamp(value - 1, min, max))}
          className="w-7 h-7 rounded bg-[#1a1a2e] border border-[#2a2a3e] text-[#ccc] text-sm hover:border-[#D94819]/60 hover:text-white transition-colors flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className="w-8 text-center text-[#f0f0f0] text-sm font-medium tabular-nums">{value}</span>
        <button
          onClick={() => onChange(clamp(value + 1, min, max))}
          className="w-7 h-7 rounded bg-[#1a1a2e] border border-[#2a2a3e] text-[#ccc] text-sm hover:border-[#D94819]/60 hover:text-white transition-colors flex items-center justify-center"
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#7a7a8a] text-xs">{label}</label>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="bg-[#1a1a2e] border border-[#2a2a3e] rounded px-2 py-1.5 text-[#f0f0f0] text-sm focus:border-[#D94819]/60 focus:outline-none"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#D94819]' : 'bg-[#2a2a3e]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-[#ccc] text-xs">{label}</span>
    </label>
  );
}

function SectionHeader({ children }) {
  return (
    <p className="text-[#7a7a8a] text-[10px] uppercase tracking-widest mb-3 mt-4 first:mt-0">{children}</p>
  );
}

function ResultBar({ label, value, max, color = '#D94819' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#8a8a9a] w-12 shrink-0 text-right tabular-nums">{value.toFixed(1)}</span>
      <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[#6a6a7a] w-8 shrink-0 tabular-nums">{(value * 100 / (max || 1)).toFixed(0)}%</span>
      <span className="text-[#5a5a7a] w-12 shrink-0 tabular-nums">{label}</span>
    </div>
  );
}

function DistributionTable({ distribution, wounds }) {
  const [open, setOpen] = useState(false);
  if (!distribution.length) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-[#8a8a9a] text-xs hover:text-[#D94819] transition-colors flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span>
        Damage distribution
      </button>
      {open && (
        <div className="mt-2 bg-[#0d0c15] border border-[#1e1e2e] rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left px-3 py-2 text-[#7a7a8a] font-normal">Damage</th>
                <th className="text-right px-3 py-2 text-[#7a7a8a] font-normal">Probability</th>
                <th className="text-right px-3 py-2 text-[#7a7a8a] font-normal">Cumulative ≥</th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((row, i) => {
                const cumulative = distribution
                  .filter(r => r.totalDmg >= row.totalDmg)
                  .reduce((sum, r) => sum + r.prob, 0);
                const isKill = row.totalDmg >= wounds;
                return (
                  <tr key={i} className={`border-b border-[#0f0e17] last:border-0 ${isKill ? 'bg-[#D94819]/5' : ''}`}>
                    <td className={`px-3 py-1.5 tabular-nums ${isKill ? 'text-[#D94819]' : 'text-[#ccc]'}`}>
                      {row.totalDmg.toFixed(1)}{isKill ? ' ★' : ''}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-[#8a8a9a]">
                      {(row.prob * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-[#6a6a7a]">
                      {(cumulative * 100).toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResultCard({ title, avgDamage, killChance, distribution, wounds, color = '#D94819' }) {
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
      {title && <p className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-3">{title}</p>}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-[#6a6a7a] text-xs mb-0.5">Avg Damage</p>
          <p className="text-3xl font-black tabular-nums" style={{ color }}>{avgDamage.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[#6a6a7a] text-xs mb-0.5">Kill Chance</p>
          <p className="text-3xl font-black tabular-nums" style={{ color: killChance > 0.5 ? '#3cc864' : killChance > 0.25 ? '#e0c83c' : color }}>
            {(killChance * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="mt-2 w-full bg-[#0d0c15] rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, killChance * 100)}%`, background: color }} />
      </div>
      <p className="text-[#6a6a7a] text-xs mt-1">{wounds} wounds to kill</p>
      <DistributionTable distribution={distribution} wounds={wounds} />
    </div>
  );
}

// ── Save roll options ─────────────────────────────────────────────────────────
const SAVE_OPTIONS = [
  { value: 2, label: '2+ Save' },
  { value: 3, label: '3+ Save' },
  { value: 4, label: '4+ Save' },
  { value: 5, label: '5+ Save' },
  { value: 6, label: '6+ Save' },
  { value: 7, label: 'No Save' },
];
const BS_OPTIONS = [
  { value: 2, label: 'BS 2+' },
  { value: 3, label: 'BS 3+' },
  { value: 4, label: 'BS 4+' },
  { value: 5, label: 'BS 5+' },
  { value: 6, label: 'BS 6+' },
];
const WS_OPTIONS = [
  { value: 2, label: 'WS 2+' },
  { value: 3, label: 'WS 3+' },
  { value: 4, label: 'WS 4+' },
  { value: 5, label: 'WS 5+' },
  { value: 6, label: 'WS 6+' },
];
const LETHAL_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 3, label: 'Lethal 3+' },
  { value: 4, label: 'Lethal 4+' },
  { value: 5, label: 'Lethal 5+' },
];
const ACCURATE_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Accurate 1' },
  { value: 2, label: 'Accurate 2' },
  { value: 3, label: 'Accurate 3' },
  { value: 4, label: 'Accurate 4' },
];
const MW_OPTIONS = [
  { value: 1, label: 'MW 1' },
  { value: 2, label: 'MW 2' },
  { value: 3, label: 'MW 3' },
  { value: 4, label: 'MW 4' },
];
const NORMAL_TO_CRIT_OPTIONS = [
  { value: 1, label: '1 normal → crit' },
  { value: 2, label: '2 normals → crits' },
  { value: 3, label: '3 normals → crits' },
  { value: 4, label: '4 normals → crits' },
];

// ── Default state ─────────────────────────────────────────────────────────────
const SHOOT_DEFAULTS = {
  attackDice: 4, bs: 3, lethalX: 0, accurateX: 0,
  dmgNorm: 3, dmgCrit: 4, ap: 0,
  defDice: 3, saveRoll: 4, saveCritRoll: 6, wounds: 8,
  severe: false, rending: false, devastating: false, mw: 1,
  brutal: false, ceaseless: false, relentless: false, punishing: false, puritySeal: false, balanced: false, normalToCrit: 0, invulnSave: false,
};

const FIGHT_DEFAULTS = {
  // Attacker
  atkDice: 4, ws: 3,
  atkDmgNorm: 3, atkDmgCrit: 4, atkAp: 0,
  defSave: 5, defCritSave: 6, defWounds: 8,
  atkSevere: false, atkRending: false, atkDevastating: false, atkMw: 1,
  atkCeaseless: false, atkRelentless: false,
  // Defender
  defDice: 4, defWs: 4,
  defDmgNorm: 3, defDmgCrit: 4, defAp: 0,
  atkSave: 5, atkCritSave: 6, atkWounds: 8,
  defSevere: false, defRending: false, defDevastating: false, defMw: 1,
  defCeaseless: false, defRelentless: false,
  firstStrike: 'attacker',
};

function parseNum(v, fallback) {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}
function parseBool(v) { return v === 'true' || v === '1'; }

// ── Shooting Tab ──────────────────────────────────────────────────────────────
function ShootingTab() {
  const [sp, setSp] = useSearchParams();

  const [s, setS] = useState(() => ({
    ...SHOOT_DEFAULTS,
    attackDice: parseNum(sp.get('s_ad'), SHOOT_DEFAULTS.attackDice),
    bs:         parseNum(sp.get('s_bs'), SHOOT_DEFAULTS.bs),
    lethalX:    parseNum(sp.get('s_lx'), SHOOT_DEFAULTS.lethalX),
    accurateX:  parseNum(sp.get('s_ac'), SHOOT_DEFAULTS.accurateX),
    dmgNorm:    parseNum(sp.get('s_dn'), SHOOT_DEFAULTS.dmgNorm),
    dmgCrit:    parseNum(sp.get('s_dc'), SHOOT_DEFAULTS.dmgCrit),
    ap:         parseNum(sp.get('s_ap'), SHOOT_DEFAULTS.ap),
    defDice:    parseNum(sp.get('s_dd'), SHOOT_DEFAULTS.defDice),
    saveRoll:   parseNum(sp.get('s_sv'), SHOOT_DEFAULTS.saveRoll),
    saveCritRoll: parseNum(sp.get('s_cs'), SHOOT_DEFAULTS.saveCritRoll),
    wounds:     parseNum(sp.get('s_w'),  SHOOT_DEFAULTS.wounds),
    severe:     parseBool(sp.get('s_se')),
    rending:    parseBool(sp.get('s_re')),
    devastating: parseBool(sp.get('s_dv')),
    mw:         parseNum(sp.get('s_mw'), SHOOT_DEFAULTS.mw),
    brutal:     parseBool(sp.get('s_br')),
    ceaseless:  parseBool(sp.get('s_ce')),
    relentless: parseBool(sp.get('s_rl')),
    punishing:  parseBool(sp.get('s_pu')),
    puritySeal: parseBool(sp.get('s_ps')),
    balanced:     parseBool(sp.get('s_ba')),
    normalToCrit: parseNum(sp.get('s_nc'), 0),
    invulnSave:   parseBool(sp.get('s_is')),
  }));

  const set = useCallback((key, val) => setS(prev => ({ ...prev, [key]: val })), []);

  const result = useMemo(() => calcShooting(s), [s]);

  function copyLink() {
    const p = new URLSearchParams({
      tab: 'shooting',
      s_ad: s.attackDice, s_bs: s.bs, s_lx: s.lethalX, s_ac: s.accurateX,
      s_dn: s.dmgNorm, s_dc: s.dmgCrit, s_ap: s.ap,
      s_dd: s.defDice, s_sv: s.saveRoll, s_cs: s.saveCritRoll, s_w: s.wounds,
      s_se: s.severe ? '1' : '0', s_re: s.rending ? '1' : '0',
      s_dv: s.devastating ? '1' : '0', s_mw: s.mw,
      s_br: s.brutal ? '1' : '0', s_ce: s.ceaseless ? '1' : '0',
      s_rl: s.relentless ? '1' : '0', s_pu: s.punishing ? '1' : '0',
      s_ps: s.puritySeal ? '1' : '0',
      s_ba: s.balanced     ? '1' : '0',
      s_nc: s.normalToCrit,
      s_is: s.invulnSave   ? '1' : '0',
    });
    navigator.clipboard.writeText(window.location.origin + '/calculator?' + p.toString());
  }

  function reset() { setS({ ...SHOOT_DEFAULTS }); }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="space-y-2">
        <SectionHeader>Weapon</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Attack Dice" value={s.attackDice} onChange={v => set('attackDice', v)} min={1} max={20} />
          <SelectField label="Ballistic Skill" value={s.bs} onChange={v => set('bs', v)} options={BS_OPTIONS} />
          <Stepper label="Dmg (Normal)" value={s.dmgNorm} onChange={v => set('dmgNorm', v)} min={1} max={20} />
          <Stepper label="Dmg (Crit)" value={s.dmgCrit} onChange={v => set('dmgCrit', v)} min={1} max={20} />
        </div>

        <SectionHeader>Special Rules</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          {/* Row 1–4: simple toggles, 2 per row */}
          <Toggle label="Severe"         checked={s.severe}       onChange={v => set('severe', v)} />
          <Toggle label="Rending"        checked={s.rending}      onChange={v => set('rending', v)} />
          <Toggle label="Ceaseless"      checked={s.ceaseless}    onChange={v => set('ceaseless', v)} />
          <Toggle label="Relentless"     checked={s.relentless}   onChange={v => set('relentless', v)} />
          <Toggle label="Brutal"         checked={s.brutal}       onChange={v => set('brutal', v)} />
          <Toggle label="Punishing"      checked={s.punishing}    onChange={v => set('punishing', v)} />
          <Toggle label="Purity Seal"    checked={s.puritySeal}   onChange={v => set('puritySeal', v)} />
          <Toggle label="Balanced"       checked={s.balanced}     onChange={v => set('balanced', v)} />
          {/* Row 5: Normal to Crit | Devastating */}
          <Toggle label="Normal to Crit" checked={s.normalToCrit > 0} onChange={v => set('normalToCrit', v ? 1 : 0)} />
          <Toggle label="Devastating"    checked={s.devastating}  onChange={v => set('devastating', v)} />
          {s.normalToCrit > 0 && (
            <div className="col-span-2 pl-4">
              <SelectField label="Normal to Crit" value={s.normalToCrit} onChange={v => set('normalToCrit', v)} options={NORMAL_TO_CRIT_OPTIONS} />
            </div>
          )}
          {s.devastating && (
            <div className="col-span-2 pl-4">
              <SelectField label="Mortal Wounds" value={s.mw} onChange={v => set('mw', v)} options={MW_OPTIONS} />
            </div>
          )}
          {/* Row 6: Lethal | Accurate */}
          <Toggle label="Lethal"   checked={s.lethalX > 0}   onChange={v => set('lethalX',  v ? 5 : 0)} />
          <Toggle label="Accurate" checked={s.accurateX > 0} onChange={v => set('accurateX', v ? 1 : 0)} />
          {s.lethalX > 0 && (
            <div className="col-span-2 pl-4">
              <SelectField label="Lethal" value={s.lethalX} onChange={v => set('lethalX', v)} options={LETHAL_OPTIONS.filter(o => o.value > 0)} />
            </div>
          )}
          {s.accurateX > 0 && (
            <div className="col-span-2 pl-4">
              <SelectField label="Accurate" value={s.accurateX} onChange={v => set('accurateX', v)} options={ACCURATE_OPTIONS.filter(o => o.value > 0)} />
            </div>
          )}
          {/* Row 7: Piercing (lone — 13 toggles total, one must be solo) */}
          <Toggle label="Piercing" checked={s.ap > 0} onChange={v => set('ap', v ? 1 : 0)} />
          <div />
          {s.ap > 0 && (
            <div className="col-span-2 pl-4">
              <Stepper label="Piercing" value={s.ap} onChange={v => set('ap', v)} min={1} max={3} />
            </div>
          )}
        </div>

        <SectionHeader>Target</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          <Stepper     label="Defence Dice" value={s.defDice}      onChange={v => set('defDice', v)}      min={1} max={6} />
          <SelectField label="Save"         value={s.saveRoll}     onChange={v => set('saveRoll', v)}     options={SAVE_OPTIONS} />
          <SelectField label="Crit Save"    value={s.saveCritRoll} onChange={v => set('saveCritRoll', v)} options={SAVE_OPTIONS} />
          <Stepper     label="Wounds"       value={s.wounds}       onChange={v => set('wounds', v)}       min={1} max={30} />
        </div>
        <p className="text-[#5a5a7a] text-xs mt-1">Standard KT24: 3 defence dice, crit save 6+</p>
        <div className="mt-2">
          <Toggle label="Invulnerable Save" checked={s.invulnSave} onChange={v => set('invulnSave', v)} />
          {s.invulnSave && (
            <p className="text-[#6a6a7a] text-xs mt-1 pl-11">Piercing has no effect on this target.</p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={copyLink} className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#D94819]/60 text-[#ccc] hover:text-white text-xs px-3 py-2 rounded transition-colors">
            Copy Link
          </button>
          <button onClick={reset} className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#D94819]/60 text-[#ccc] hover:text-white text-xs px-3 py-2 rounded transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        <SectionHeader>Results</SectionHeader>
        <ResultCard
          avgDamage={result.avgDamage}
          killChance={result.killChance}
          distribution={result.distribution}
          wounds={s.wounds}
        />

        <div className="mt-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <p className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-3">Damage Breakdown</p>
          <div className="space-y-1.5">
            {result.distribution.slice(0, 12).map((row, i) => (
              <ResultBar
                key={i}
                label={`dmg ${row.totalDmg.toFixed(1)}`}
                value={row.prob * 100}
                max={100}
                color={row.totalDmg >= s.wounds ? '#3cc864' : '#D94819'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fighting Tab ──────────────────────────────────────────────────────────────
function FighterInputs({ title, prefix, s, set, isAttacker }) {
  return (
    <div className="bg-[#0d0c15] border border-[#1e1e2e] rounded-xl p-4">
      <p className="text-[#f0f0f0] text-sm font-medium mb-3">{title}</p>

      <SectionHeader>Weapon</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <Stepper label="Fight Dice"  value={s[`${prefix}Dice`]}    onChange={v => set(`${prefix}Dice`, v)}    min={1} max={20} />
        <SelectField label="Weapon Skill" value={s[prefix === 'atk' ? 'ws' : 'defWs']} onChange={v => set(prefix === 'atk' ? 'ws' : 'defWs', v)} options={WS_OPTIONS} />
        <Stepper label="Dmg (Normal)" value={s[`${prefix}DmgNorm`]} onChange={v => set(`${prefix}DmgNorm`, v)} min={1} max={20} />
        <Stepper label="Dmg (Crit)"   value={s[`${prefix}DmgCrit`]} onChange={v => set(`${prefix}DmgCrit`, v)} min={1} max={20} />
        <Stepper label="AP"           value={s[`${prefix}Ap`]}      onChange={v => set(`${prefix}Ap`, v)}      min={0} max={6} />
      </div>

      <SectionHeader>Special Rules</SectionHeader>
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="Severe"     checked={s[`${prefix}Severe`]}     onChange={v => set(`${prefix}Severe`, v)} />
        <Toggle label="Rending"    checked={s[`${prefix}Rending`]}    onChange={v => set(`${prefix}Rending`, v)} />
        <Toggle label="Ceaseless"  checked={s[`${prefix}Ceaseless`]}  onChange={v => set(`${prefix}Ceaseless`, v)} />
        <Toggle label="Relentless" checked={s[`${prefix}Relentless`]} onChange={v => set(`${prefix}Relentless`, v)} />
        <div className="col-span-2">
          <Toggle label="Devastating" checked={s[`${prefix}Devastating`]} onChange={v => set(`${prefix}Devastating`, v)} />
          {s[`${prefix}Devastating`] && (
            <div className="mt-2 pl-4">
              <SelectField label="Mortal Wounds" value={s[`${prefix}Mw`]} onChange={v => set(`${prefix}Mw`, v)} options={MW_OPTIONS} />
            </div>
          )}
        </div>
      </div>

      <SectionHeader>Opponent's Defence</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Save"      value={isAttacker ? s.defSave     : s.atkSave}     onChange={v => set(isAttacker ? 'defSave'     : 'atkSave',     v)} options={SAVE_OPTIONS} />
        <SelectField label="Crit Save" value={isAttacker ? s.defCritSave : s.atkCritSave} onChange={v => set(isAttacker ? 'defCritSave' : 'atkCritSave', v)} options={SAVE_OPTIONS} />
        <Stepper     label="Wounds"    value={isAttacker ? s.defWounds   : s.atkWounds}   onChange={v => set(isAttacker ? 'defWounds'   : 'atkWounds',   v)} min={1} max={30} />
      </div>
    </div>
  );
}

function FightingTab() {
  const [sp] = useSearchParams();
  const [s, setS] = useState({ ...FIGHT_DEFAULTS });
  const set = useCallback((key, val) => setS(prev => ({ ...prev, [key]: val })), []);

  const result = useMemo(() => calcFighting(s), [s]);

  function copyLink() {
    const p = new URLSearchParams({ tab: 'fighting', ...Object.fromEntries(Object.entries(s)) });
    navigator.clipboard.writeText(window.location.origin + '/calculator?' + p.toString());
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FighterInputs title="Attacker" prefix="atk" s={s} set={set} isAttacker={true} />
        <FighterInputs title="Defender" prefix="def" s={s} set={set} isAttacker={false} />
      </div>

      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          <p className="text-[#7a7a8a] text-xs uppercase tracking-widest">First Strike</p>
          {['attacker', 'defender'].map(side => (
            <button
              key={side}
              onClick={() => set('firstStrike', side)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize
                ${s.firstStrike === side
                  ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10'
                  : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'}`}
            >
              {side}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultCard
          title="Attacker → Defender"
          avgDamage={result.attacker.avgDamage}
          killChance={result.attacker.killChance}
          distribution={result.attacker.distribution}
          wounds={s.defWounds}
          color="#D94819"
        />
        <ResultCard
          title="Defender → Attacker"
          avgDamage={result.defender.avgDamage}
          killChance={result.defender.killChance}
          distribution={result.defender.distribution}
          wounds={s.atkWounds}
          color="#a88be0"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={copyLink} className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#D94819]/60 text-[#ccc] hover:text-white text-xs px-3 py-2 rounded transition-colors">
          Copy Link
        </button>
        <button onClick={() => setS({ ...FIGHT_DEFAULTS })} className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#D94819]/60 text-[#ccc] hover:text-white text-xs px-3 py-2 rounded transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Calculator() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'fighting' ? 'fighting' : 'shooting';
  const [tab, setTab] = useState(initialTab);

  return (
    <div id="main-content" className="min-h-[calc(100vh-80px)] bg-[#0f0e17]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[#f0f0f0] text-xl font-black mb-1">Combat Calculator</h1>
          <p className="text-[#7a7a8a] text-xs">Exact probability — no Monte Carlo. All maths in browser.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-1 w-fit">
          {[
            { id: 'shooting', label: 'Shooting' },
            { id: 'fighting', label: 'Fighting' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-[#D94819] text-white'
                  : 'text-[#8a8a9a] hover:text-[#e0e0f0]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'shooting' ? <ShootingTab /> : <FightingTab />}
      </div>
    </div>
  );
}
