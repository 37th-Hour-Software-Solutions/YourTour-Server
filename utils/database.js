const db = require('better-sqlite3')('app.db');

/**
 * @returns {Promise<void>}
 */
async function init() {
  db.pragma("journal_mode = WAL"); // WAL is a journal mode that allows for faster writes and better concurrency
  db.exec("PRAGMA foreign_keys = ON"); // Enables foreign key constraints in SQLite

  // Create the tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
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

  // Insert badges

  db.exec(`
    INSERT INTO Badges (name, description, static_image_url) VALUES 
      ('Tourist I', 'Visit 50 unique cities', 'bronze_tourist_badge.png'),
      ('Tourist II', 'Visit 100 unique cities', 'silver_tourist_badge.png'),
      ('Tourist III', 'Visit 200 unique cities', 'gold_tourist_badge.png'),
      ('Tourist IV', 'Visit 500 unique cities', 'diamond_tourist_badge.png'),
      ('Tourist V', 'Visit 1000 unique cities', 'emerald_tourist_badge.png'),
      ('Gem Hunter', 'Find 1 gem', 'bronze_gem_badge.png'),
      ('Gem Hunter II', 'Find 5 gems', 'silver_gem_badge.png'),
      ('Gem Hunter III', 'Find 20 gems', 'gold_gem_badge.png'),
      ('Gem Hunter IV', 'Find 50 gems', 'diamond_gem_badge.png'),
      ('Gem Hunter V', 'Find 100 gems', 'emerald_gem_badge.png'),
      ('In The Wild', 'Visit a city that has no facts', 'wild_badge.png'),
      ('Cross Country', 'Visit all 50 states', 'cross_country_badge.png'),
      ('Explorer I', 'Visit 3 unique states', 'bronze_explorer_badge.png'),
      ('Explorer II', 'Visit 5 unique states', 'silver_explorer_badge.png'),
      ('Explorer III', 'Visit 10 unique states', 'gold_explorer_badge.png'),
      ('Explorer IV', 'Visit 20 unique states', 'diamond_explorer_badge.png'),
      ('Explorer V', 'Visit 50 unique states', 'emerald_explorer_badge.png')
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    INSERT INTO Interests (name, description) VALUES 
      ('History', 'Learn about the history of the United States'),
      ('Geography', 'Learn about the geography of the United States'),
      ('Culture', 'Learn about the culture of the United States'),
      ('Food', 'Learn about the food of the United States'),
      ('Sports', 'Learn about the sports of the United States')
  `);
}


module.exports = {
  db,
  init,
};