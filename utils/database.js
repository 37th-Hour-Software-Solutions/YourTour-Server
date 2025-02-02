const db = require('better-sqlite3')('app.db');
const bcrypt = require('bcrypt');

/**
 * @returns {Promise<void>}
 */
async function init() {
  db.pragma("journal_mode = WAL"); // WAL is a journal mode that allows for faster writes and better concurrency
  db.exec("PRAGMA foreign_keys = ON"); // Enables foreign key constraints in SQLite

  // Create the tables with a unique index on username
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      hashedPassword TEXT NOT NULL,
      phone TEXT NOT NULL,
      homestate TEXT NOT NULL,
      gemsFound INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      facts JSON NOT NULL,
      is_gem BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS History (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      trip_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (location_id) REFERENCES Locations(id),
      FOREIGN KEY (trip_id) REFERENCES Trips(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startingTown TEXT NOT NULL,
      endingTown TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      static_image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS UserBadges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (badge_id) REFERENCES Badges(id)
    )
  `);

  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges ON UserBadges(user_id, badge_id)`);

  try {
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_badge_name ON Badges(name);
    `);

    const badges = [
      ['Tourist I', 'Visit 50 unique cities', 'bronze_tourist_badge.png'],
      ['Tourist II', 'Visit 100 unique cities', 'silver_tourist_badge.png'],
      ['Tourist III', 'Visit 200 unique cities', 'gold_tourist_badge.png'],
      ['Tourist IV', 'Visit 500 unique cities', 'diamond_tourist_badge.png'],
      ['Tourist V', 'Visit 1000 unique cities', 'emerald_tourist_badge.png'],
      ['Gem Hunter', 'Find 1 gem', 'bronze_gem_badge.png'],
      ['Gem Hunter II', 'Find 5 gems', 'silver_gem_badge.png'],
      ['Gem Hunter III', 'Find 20 gems', 'gold_gem_badge.png'],
      ['Gem Hunter IV', 'Find 50 gems', 'diamond_gem_badge.png'],
      ['Gem Hunter V', 'Find 100 gems', 'emerald_gem_badge.png'],
      ['In The Wild', 'Visit a city that has no facts', 'wild_badge.png'],
      ['Cross Country', 'Visit all 50 states', 'cross_country_badge.png'],
      ['Explorer I', 'Visit 3 unique states', 'bronze_explorer_badge.png'],
      ['Explorer II', 'Visit 5 unique states', 'silver_explorer_badge.png'],
      ['Explorer III', 'Visit 10 unique states', 'gold_explorer_badge.png'],
      ['Explorer IV', 'Visit 20 unique states', 'diamond_explorer_badge.png'],
      ['Explorer V', 'Visit 50 unique states', 'emerald_explorer_badge.png']
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO Badges (name, description, static_image_url) VALUES (?, ?, ?)
    `);
    badges.forEach(badge => {
      stmt.run(badge);
    });
  } catch (error) {
    console.error("Error inserting badges: ", error);
  }

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Interests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_interest_name ON Interests(name);
    `);

    const interests = [
      'history',
      'geography',
      'culture',
      'food',
      'sports',
      'kayaking',
      'fishing',
      'movies',
      'tech',
      'music',
      'solo travel',
      'animals',
      'cross country',
      'live events',
      'hiking',
      'working out',
      'community culture'
    ];

    const interestStmt = db.prepare(`
      INSERT OR IGNORE INTO Interests (name) VALUES (?)
    `);
    interests.forEach(interest => {
      interestStmt.run(interest);
    });

    db.exec(`
      CREATE TABLE IF NOT EXISTS UserInterests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        interest_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id),
        FOREIGN KEY (interest_id) REFERENCES Interests(id)
      )
    `);
    
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interests ON UserInterests(user_id, interest_id)`);


  } catch (error) {
    console.error("Error setting up interests: ", error);
  }

  try {
    // Generate bcrypt hash for the admin password
    const adminPassword = "Password123!";
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    // Insert default admin user
    db.exec(`
      INSERT OR IGNORE INTO Users (username, email, hashedPassword, phone, homestate, gemsFound) VALUES 
      ('john', 'john@example.com', '${hashedPassword}', '0000000000', 'TN', 9999)
    `);

    // Retrieve all badge and interest IDs and insert them for the admin user
//    const badgeIds = db.prepare('SELECT id FROM Badges').all();
//    badgeIds.forEach(({ id }) => {
//      db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, ${id})`);
//    });

    db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, 1)`);
    db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, 6)`);
    db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, 12)`);


//    const interestIds = db.prepare('SELECT id FROM Interests').all();
//    interestIds.forEach(({ id }) => {
//      db.exec(`INSERT OR IGNORE INTO UserInterests (user_id, interest_id) VALUES (1, ${id})`);
//    });
//
    db.exec(`INSERT OR IGNORE INTO UserInterests (user_id, interest_id) VALUES (1, 1)`);
    db.exec(`INSERT OR IGNORE INTO UserInterests (user_id, interest_id) VALUES (1, 2)`);
    db.exec(`INSERT OR IGNORE INTO UserInterests (user_id, interest_id) VALUES (1, 3)`);

  } catch (error) {
    console.error("Error setting up admin user: ", error);
  }
}

module.exports = {
  db,
  init,
};