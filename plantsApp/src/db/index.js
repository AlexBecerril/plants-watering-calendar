import SQLite from 'react-native-sqlite-storage';
import { createTables } from './schema';

SQLite.enablePromise(true);

let db;

export const initDB = async () => {
  try {
    db = await SQLite.openDatabase({ name: 'plants.db', location: 'default' });
    console.log('DB connected');

    // Ejecutar cada tabla por separado
    await db.executeSql(`
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
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS moisture_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        value INTEGER NOT NULL,
        FOREIGN KEY (plant_id) REFERENCES plants(id)
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS watering_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (plant_id) REFERENCES plants(id)
      )
    `);

    console.log('All tables created or verified');
    return db;
  } catch (error) {
    console.log('DB init error:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('DB not initialized. Call initDB() first.');
  }
  return db;
};