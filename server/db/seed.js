import db from './schema.js';

const factions = [
  // Classified
  { name: 'Angels of Death',          faction_group: 'Classified' },
  { name: 'Battleclade',              faction_group: 'Classified' },
  { name: 'Blades of Khaine',         faction_group: 'Classified' },
  { name: 'Brood Brothers',           faction_group: 'Classified' },
  { name: 'Canoptek Circle',          faction_group: 'Classified' },
  { name: 'Celestian Insidiants',     faction_group: 'Classified' },
  { name: 'Chaos Cult',               faction_group: 'Classified' },
  { name: 'Deathwatch',               faction_group: 'Classified' },
  { name: 'Exaction Squad',           faction_group: 'Classified' },
  { name: 'Farstalker Kinband',       faction_group: 'Classified' },
  { name: 'Fellgor Ravagers',         faction_group: 'Classified' },
  { name: 'Goremongers',              faction_group: 'Classified' },
  { name: 'Hand of the Archon',       faction_group: 'Classified' },
  { name: 'Hearthkyn Salvagers',      faction_group: 'Classified' },
  { name: 'Hernkyn Yaegirs',          faction_group: 'Classified' },
  { name: 'Hierotek Circle',          faction_group: 'Classified' },
  { name: 'Imperial Navy Breachers',  faction_group: 'Classified' },
  { name: 'Inquisitorial Agents',     faction_group: 'Classified' },
  { name: 'Kasrkin',                  faction_group: 'Classified' },
  { name: 'Mandrakes',                faction_group: 'Classified' },
  { name: 'Murderwing',               faction_group: 'Classified' },
  { name: 'Nemesis Claw',             faction_group: 'Classified' },
  { name: 'Plague Marines',           faction_group: 'Classified' },
  { name: 'Ratlings',                 faction_group: 'Classified' },
  { name: 'Raveners',                 faction_group: 'Classified' },
  { name: 'Sanctifiers',              faction_group: 'Classified' },
  { name: 'Scout Squad',              faction_group: 'Classified' },
  { name: 'Tempestus Aquilons',       faction_group: 'Classified' },
  { name: 'Vespid Stingwings',        faction_group: 'Classified' },
  { name: 'Wolf Scouts',              faction_group: 'Classified' },
  { name: 'Wrecka Krew',              faction_group: 'Classified' },
  { name: 'XV26 Stealth Battlesuits', faction_group: 'Classified' },

  // Declassified
  { name: 'Blooded',                  faction_group: 'Declassified' },
  { name: 'Corsair Voidscarred',      faction_group: 'Declassified' },
  { name: 'Death Korps',              faction_group: 'Declassified' },
  { name: 'Elucidian Starstriders',   faction_group: 'Declassified' },
  { name: 'Gellerpox Infected',       faction_group: 'Declassified' },
  { name: 'Hunter Clade',             faction_group: 'Declassified' },
  { name: 'Kommandos',                faction_group: 'Declassified' },
  { name: 'Legionaries',              faction_group: 'Declassified' },
  { name: 'Novitiates',               faction_group: 'Declassified' },
  { name: 'Pathfinders',              faction_group: 'Declassified' },
  { name: 'Phobos Strike Team',       faction_group: 'Declassified' },
  { name: 'Void-Dancer Troupe',       faction_group: 'Declassified' },
  { name: 'Warpcoven',                faction_group: 'Declassified' },
  { name: 'Wyrmblade',                faction_group: 'Declassified' },
];

// Clear and re-seed so old names don't remain
db.prepare('DELETE FROM factions').run();

const insert = db.prepare(
  'INSERT INTO factions (name, faction_group, icon_url) VALUES (?, ?, NULL)'
);

const insertMany = db.transaction((rows) => {
  for (const f of rows) insert.run(f.name, f.faction_group);
});

insertMany(factions);

const count = db.prepare('SELECT COUNT(*) as count FROM factions').get();
console.log(`Seeded ${count.count} factions.`);
