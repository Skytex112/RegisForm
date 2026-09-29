import { type SQLiteDatabase } from 'expo-sqlite';
import { type UserRecord } from '../types/user';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      age INTEGER NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      city TEXT NOT NULL,
      password TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      gender TEXT NOT NULL,
      registration_goal TEXT NOT NULL,
      newsletter_consent INTEGER NOT NULL,
      photo_uri TEXT,
      created_at TEXT NOT NULL
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(users)');
  const existingColumns = new Set(columns.map((column) => column.name));
  const missingColumns = [
    ['first_name', "ALTER TABLE users ADD COLUMN first_name TEXT NOT NULL DEFAULT ''"],
    ['last_name', "ALTER TABLE users ADD COLUMN last_name TEXT NOT NULL DEFAULT ''"],
    ['birth_date', "ALTER TABLE users ADD COLUMN birth_date TEXT NOT NULL DEFAULT ''"],
    ['age', 'ALTER TABLE users ADD COLUMN age INTEGER NOT NULL DEFAULT 0'],
    ['phone', "ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT ''"],
    ['email', "ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT ''"],
    ['city', "ALTER TABLE users ADD COLUMN city TEXT NOT NULL DEFAULT ''"],
    ['password', "ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''"],
    ['password_hash', "ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''"],
    ['gender', "ALTER TABLE users ADD COLUMN gender TEXT NOT NULL DEFAULT ''"],
    ['registration_goal', "ALTER TABLE users ADD COLUMN registration_goal TEXT NOT NULL DEFAULT ''"],
    ['newsletter_consent', 'ALTER TABLE users ADD COLUMN newsletter_consent INTEGER NOT NULL DEFAULT 0'],
    ['photo_uri', 'ALTER TABLE users ADD COLUMN photo_uri TEXT'],
    ['created_at', "ALTER TABLE users ADD COLUMN created_at TEXT NOT NULL DEFAULT ''"],
  ] as const;

  for (const [columnName, sql] of missingColumns) {
    if (!existingColumns.has(columnName)) {
      await db.execAsync(sql);
    }
  }
}

export async function createUser(db: SQLiteDatabase, values: Omit<UserRecord, 'id'>) {
  await db.runAsync(
    `INSERT INTO users
      (first_name, last_name, birth_date, age, phone, email, city, password,
       password_hash, gender, registration_goal, newsletter_consent, photo_uri, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values.first_name,
    values.last_name,
    values.birth_date,
    values.age,
    values.phone,
    values.email,
    values.city,
    values.password,
    values.password_hash,
    values.gender,
    values.registration_goal,
    values.newsletter_consent,
    values.photo_uri,
    new Date().toISOString(),
  );
}

export function getUserByEmail(db: SQLiteDatabase, email: string) {
  return db.getFirstAsync<UserRecord>(
    'SELECT * FROM users WHERE email = ? ORDER BY id DESC LIMIT 1',
    email,
  );
}
