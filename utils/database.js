const db = require('better-sqlite3')('app.db');
const bcrypt = require('bcrypt');
const { BADGES, GEMS, INTERESTS } = require('./config');

/**
 * @returns {Promise<void>}
 */
async function init() {
  db.pragma("journal_mode = WAL"); // WAL is a journal mode that allows for faster writes and better concurrency
  db.pragma("foreign_keys = ON"); // Enables foreign key constraints in SQLite

  // Create the tables with a unique index on username
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      hashedPassword TEXT NOT NULL,
      phone TEXT NOT NULL,
      homestate TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      facts JSON NOT NULL,
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
    CREATE TABLE IF NOT EXISTS Gems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS UserGems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      gem_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (gem_id) REFERENCES Gems(id)
    )
  `);

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

  // Create unique indexes
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_badge_name ON Badges(name)`);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges ON UserBadges(user_id, badge_id)`);

  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_gem_city_state ON Gems(city, state)`);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_gems ON UserGems(user_id, gem_id)`);

  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_interest_name ON Interests(name)`);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interests ON UserInterests(user_id, interest_id)`);

  const stmtBadges = db.prepare(`INSERT OR IGNORE INTO Badges (name, description, static_image_url) VALUES (?, ?, ?)`);
  BADGES.forEach(badge => stmtBadges.run(badge.name, badge.description, badge.static_image_url));

  const stmtGems = db.prepare(`INSERT OR IGNORE INTO Gems (city, state, description) VALUES (?, ?, ?)`);
  GEMS.forEach(gem => stmtGems.run(gem.city, gem.state, gem.description));

  const stmtInterests = db.prepare(`INSERT OR IGNORE INTO Interests (name) VALUES (?)`);
  INTERESTS.forEach(interest => stmtInterests.run(interest.name));

  // Create demo user
  try {
    // Generate bcrypt hash for the admin password
    const adminPassword = "Password123!";
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    // Insert default admin user
    db.exec(`
      INSERT OR IGNORE INTO Users (username, email, hashedPassword, phone, homestate) VALUES 
      ('john', 'john@example.com', '${hashedPassword}', '+19315815560', 'TN')
    `);

    db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, 1)`);
    db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, 6)`);
    db.exec(`INSERT OR IGNORE INTO UserBadges (user_id, badge_id) VALUES (1, 12)`);

    db.exec(`INSERT OR IGNORE INTO UserGems (user_id, gem_id) VALUES (1, 3)`);
    db.exec(`INSERT OR IGNORE INTO UserGems (user_id, gem_id) VALUES (1, 6)`);
    db.exec(`INSERT OR IGNORE INTO UserGems (user_id, gem_id) VALUES (1, 9)`);
    db.exec(`INSERT OR IGNORE INTO UserGems (user_id, gem_id) VALUES (1, 12)`);
    db.exec(`INSERT OR IGNORE INTO UserGems (user_id, gem_id) VALUES (1, 15)`);

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