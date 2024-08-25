const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./clinic.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT,createdDate DateTime)");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NULL,
        email TEXT NULL,
        cnic TEXT NULL,
        phone TEXT,
        cell TEXT,
        address TEXT,
        notes TEXT,
        specialization TEXT NULL,
        image_path TEXT
    )`);
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS opd (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    slip_no TEXT UNIQUE,
    name TEXT,
    relation TEXT,
    age INTEGER,
    gender TEXT,
    cnic TEXT,
    contact TEXT,
    address TEXT,
    doctor TEXT,
    referred_to TEXT,
    remarks TEXT,
    service TEXT,
    eye TEXT,
    qty INTEGER,
    rate REAL,
    amount REAL,
    image_path TEXT
);`);
});



module.exports = db;
