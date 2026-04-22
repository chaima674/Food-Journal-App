import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('FoodJournal.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        email TEXT UNIQUE, 
        password TEXT
      );
    `);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS journals (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        userId INTEGER, 
        image TEXT, 
        description TEXT, 
        date TEXT, 
        category TEXT
      );
    `);
    
    console.log('Database ready');
    return true;
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
};

// For SELECT queries - returns rows properly
export const executeSql = async (query, params = []) => {
  try {
    if (!db) await initDatabase();
    const result = await db.getAllAsync(query, params);
    return { rows: result };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// For INSERT, UPDATE, DELETE queries
export const runSql = async (query, params = []) => {
  try {
    if (!db) await initDatabase();
    const result = await db.runAsync(query, params);
    return { insertId: result.lastInsertRowId, rowsAffected: result.changes };
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
};