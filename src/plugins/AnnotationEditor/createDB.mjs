import Database from "better-sqlite3";

const db = new Database("tmp/database.db", { verbose: console.log });
db.exec(`CREATE TABLE annotations  (
	id INTEGER PRIMARY KEY,
	canvas TEXT NOT NULL,
	annotations TEXT NOT NULL,
	user_id INTEGER NOT NULL
)`);
