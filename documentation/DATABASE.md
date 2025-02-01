# Database

For now, we utilize SQLite as our DBMS. It is stored in `/app.db`. Eventually, we should migrate to a more robust DBMS such as PostgreSQL that can handle more concurrent users and scale better. The database schema is as follows:

```sql
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    hashedPassword TEXT NOT NULL,
    phone TEXT NOT NULL,
    homestate TEXT NOT NULL,
    gemsFound INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    facts JSON NOT NULL,
    is_gem BOOLEAN NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS History (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    trip_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id),
    FOREIGN KEY (trip_id) REFERENCES Trips(id)
);

CREATE TABLE IF NOT EXISTS Trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    static_image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserBadges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (badge_id) REFERENCES Badges(id)
);

CREATE TABLE IF NOT EXISTS Interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserInterests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    interest_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (interest_id) REFERENCES Interests(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_badge_name ON Badges(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_interest_name ON Interests(name);


```

We initialize both badges and interests during database creation. Eventually there would need to be an API or web interface to manage these but for now they will be manually specified in the schema

```js

// populate badges

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

// populate Interests

const interests = [
    'History',
    'Geography',
    'Culture',
    'Food',
    'Sports',
    'Kayaking',
    'Fishing',
    'Movies',
    'Tech',
    'Music',
    'Solo Travel',
    'Animals',
    'Cross Country',
    'Live Events',
    'Hiking',
    'Working Out',
    'Community Culture'
];

const interestStmt = db.prepare(`
    INSERT OR IGNORE INTO Interests (name) VALUES (?)
`);
interests.forEach(interest => {
    interestStmt.run(interest);
});


```