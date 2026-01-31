export const createTables = `
CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    scientific_name TEXT,
    image TEXT,
    humidity_min INTEGER,
    humidity_max INTEGER,
    drought_risk INTEGER,
    flood_risk INTEGER,
    comments TEXT,
    last_watering_date TEXT,
    creation_date TEXT DEFAULT (DATE('now'))
);

CREATE TABLE IF NOT EXISTS moisture_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    value INTEGER NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

CREATE TABLE IF NOT EXISTS watering_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);
`;