const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "user_db"
});

// Connect to MySQL Database
db.connect(err => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err.message);
        process.exit(1);
    }
    console.log("✅ MySQL Connected...");
});

// Signup Route
app.post("/signup", (req, res) => {
    const { name, surname, email, mobile, password } = req.body;

    if (!/^[0-9]{10}$/.test(mobile)) return res.status(400).json({ message: "Invalid mobile number!" });
    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: "Invalid email format!" });

    db.query("SELECT * FROM users WHERE email = ? OR mobile = ?", [email, mobile], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error!", error: err.message });

        if (results.length > 0) {
            return res.status(409).json({ message: "User already exists!" });
        }

        db.query("INSERT INTO users (name, surname, email, mobile, password) VALUES (?, ?, ?, ?, ?)",
            [name, surname, email, mobile, password], (err) => {
                if (err) return res.status(500).json({ message: "Database error!", error: err.message });
                res.status(201).json({ message: "Signup successful! Please login." });
            });
    });
});

// Login Route
app.post("/login", (req, res) => {
    const { emailMobile, password } = req.body;
    db.query("SELECT * FROM users WHERE (email = ? OR mobile = ?) AND password = ?", [emailMobile, emailMobile, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error!", error: err.message });

        if (results.length > 0) {
            return res.json({ success: true, message: "Login successful!" });
        }
        res.status(401).json({ success: false, message: "User not found. Please sign up!" });
    });
});

// Add a Book (Admin only)
app.post("/add-book", (req, res) => {
    console.log("Incoming request data:", req.body); // Debugging log

    const { title, author, publication, book_type } = req.body;

    if (!title || !author || !publication || !book_type) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const sql = "INSERT INTO books (title, author, publication, book_type) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, author, publication, book_type], (err, result) => {
        if (err) {
            console.error("❌ Error adding book:", err.message);
            return res.status(500).json({ message: "Database error!", error: err.message });
        }
        console.log("✅ Book added successfully:", result.insertId);
        res.status(201).json({ message: "Book added successfully!", bookId: result.insertId });
    });
});

// Delete a Book (Admin only)
app.delete("/delete-book/:id", (req, res) => {
    const bookId = req.params.id;
    db.query("DELETE FROM books WHERE id = ?", [bookId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error!", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Book not found!" });
        res.json({ message: "Book deleted successfully!" });
    });
});

// Fetch All Books (For Dashboard)
app.get("/books", (req, res) => {
    db.query("SELECT * FROM books", (err, results) => {
        if (err) return res.status(500).json({ message: "Database error!", error: err.message });
        res.json(results);
    });
});

// Issue Book
app.post('/issue-book', (req, res) => {
    const { bookId, name, mobile, startDate, endDate } = req.body;

    // Fetch the book name from the books table
    const getBookNameQuery = "SELECT title FROM books WHERE id = ?";
    db.query(getBookNameQuery, [bookId], (err, result) => {
        if (err) {
            console.error("❌ Error fetching book name:", err.message);
            return res.status(500).json({ message: "Database error!", error: err.message });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: "Book not found!" });
        }

        const bookName = result[0].title;

        // Insert into issued_books table with book name
        const insertQuery = "INSERT INTO issued_books (book_id, book_name, name, mobile, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(insertQuery, [bookId, bookName, name, mobile, startDate, endDate], (err, result) => {
            if (err) {
                console.error("❌ Database error:", err.message);
                return res.status(500).json({ message: "Database error!", error: err.message });
            }
            console.log("✅ Book issued successfully:", result.insertId);
            res.status(201).json({ message: "Book issued successfully!" });
        });
    });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
