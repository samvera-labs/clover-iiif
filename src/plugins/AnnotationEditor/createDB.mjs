import Database from "better-sqlite3";

const db = new Database("tmp/database.db", { verbose: console.log });
db.exec(`CREATE TABLE annotations  (
	id INTEGER PRIMARY KEY,
	canvas TEXT NOT NULL,
	annotation TEXT NOT NULL,
	object_id INTEGER NOT NULL,
	token TEXT NOT NULL,
	annotation_id INTEGER NOT NULL
)`);
