const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database("./mydatabase.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

db.run(
    `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT
)`,
    (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        }
    },
);

app.post("/add-user", (req, res) => {
    const { name, email } = req.body;
    db.run(
        `INSERT INTO users (name, email) VALUES (?, ?)`,
        [name, email],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({
                    message:
                        `A row has been inserted with rowid ${this.lastID}`,
                });
            }
        },
    );
});

// New endpoint to fetch all users
app.get("/users", (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ users: rows });
        }
    });
});

// New endpoint to update a user
app.put("/update-user/:id", (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    db.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [
        name,
        email,
        id,
    ], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({
                message: `Row(s) updated: ${this.changes}`,
            });
        }
    });
});

// New endpoint to delete a user

app.delete('/delete-user/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ message: `Row(s) deleted: ${this.changes}` });
      }
    });
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
