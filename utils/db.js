const db = require('better-sqlite3')('app.db');

// Users (id[Primary], username, name, email, hashedPassword, phone?, created_at)
// Locations (id[Primary], city, state, facts[JSON type], is_gem, created_at)
// History (id[Primary], user_id[Foreign], location_id[Foreign], created_at)

/**
 * @returns {Promise<void>}
 */
async function init() {
    db.pragma('journal_mode = WAL'); // WAL is a journal mode that allows for faster writes and better concurrency
    db.exec('PRAGMA foreign_keys = ON'); // Enables foreign key constraints in SQLite

    // Create the tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            hashedPassword TEXT NOT NULL,
            phone TEXT NOT NULL,
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (location_id) REFERENCES Locations(id)
        )
    `);
}


module.exports = {
    db,
    init
}