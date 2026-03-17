import db from '../db/schema.js';

function normStr(v) {
  return String(v ?? '').trim().toLowerCase();
}

function rulesChanged(dbRow, incoming) {
  return (
    normStr(dbRow.content)   !== normStr(incoming.content)   ||
    normStr(dbRow.page_ref)  !== normStr(incoming.page_ref)  ||
    normStr(dbRow.category)  !== normStr(incoming.category)
  );
}

function datacardsChanged(dbRow, incoming) {
  return (
    normStr(dbRow.stats_json)     !== normStr(JSON.stringify(incoming.stats ?? {})) ||
    normStr(dbRow.weapons_json)   !== normStr(JSON.stringify(incoming.weapons ?? [])) ||
    normStr(dbRow.abilities_json) !== normStr(JSON.stringify(incoming.abilities ?? []))
  );
}

function teamRulesChanged(dbRow, incoming) {
  return (
    normStr(dbRow.description) !== normStr(incoming.description) ||
    String(dbRow.cost)         !== String(incoming.cost ?? 0)
  );
}

export function computeDiff(aiJson) {
  const result = { new: [], modified: [], removed: [], unchanged: [] };

  // ── Rules ──────────────────────────────────────────────────────────────────
  const dbRules = db.prepare('SELECT * FROM rules').all();
  for (const incoming of (aiJson.rules ?? [])) {
    const match = dbRules.find(r => normStr(r.title) === normStr(incoming.title));
    if (!match) {
      result.new.push({ type: 'rule', data: incoming });
    } else if (rulesChanged(match, incoming)) {
      result.modified.push({ type: 'rule', id: match.id, old: match, data: incoming });
    } else {
      result.unchanged.push({ type: 'rule', id: match.id });
    }
  }
  // Detect removed rules (in DB but not in incoming)
  for (const dbRow of dbRules) {
    const stillPresent = (aiJson.rules ?? []).some(r => normStr(r.title) === normStr(dbRow.title));
    if (!stillPresent) {
      result.removed.push({ type: 'rule', id: dbRow.id, old: dbRow });
    }
  }

  // ── Datacards ──────────────────────────────────────────────────────────────
  const dbCards = db.prepare('SELECT * FROM datacards').all();
  for (const incoming of (aiJson.datacards ?? [])) {
    const match = dbCards.find(c => normStr(c.operative_name) === normStr(incoming.operative_name));
    if (!match) {
      result.new.push({ type: 'datacard', data: incoming });
    } else if (datacardsChanged(match, incoming)) {
      result.modified.push({ type: 'datacard', id: match.id, old: match, data: incoming });
    } else {
      result.unchanged.push({ type: 'datacard', id: match.id });
    }
  }

  // ── Team rules ─────────────────────────────────────────────────────────────
  const dbTeamRules = db.prepare('SELECT * FROM team_rules').all();
  const dbFactions  = db.prepare('SELECT * FROM factions').all();

  for (const incoming of (aiJson.team_rules ?? [])) {
    const match = dbTeamRules.find(r =>
      normStr(r.name) === normStr(incoming.name) &&
      normStr(r.type) === normStr(incoming.type)
    );
    if (!match) {
      result.new.push({ type: 'team_rule', data: incoming });
    } else if (teamRulesChanged(match, incoming)) {
      result.modified.push({ type: 'team_rule', id: match.id, old: match, data: incoming });
    } else {
      result.unchanged.push({ type: 'team_rule', id: match.id });
    }
  }

  return result;
}
