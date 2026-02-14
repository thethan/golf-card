import * as SQLite from "expo-sqlite";
import { SCHEMA_SQL } from "./schema";

export type Db = SQLite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
  const db = await SQLite.openDatabaseAsync("golf.db");
  await db.execAsync(SCHEMA_SQL);
  return db;
}