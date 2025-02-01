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
      interests JSON NOT NULL DEFAULT '[]',
      gemsFound INTEGER DEFAULT 0,
      badges JSON NOT NULL DEFAULT '[]',
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
}


module.exports = {
  db,
  init,
};