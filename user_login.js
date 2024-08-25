const db = require('database.js')
const bcrypt = require('bcryptjs');

function registerUser(username, password, callback) {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);

        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], function(err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID });
        });
    });
}

module.exports = { registerUser };
