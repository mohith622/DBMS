const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Allow reading JSON from frontend and serve public files
app.use(express.json());
app.use(express.static('public'));

// 1. Set up the Database Connection (Hardcoded to keep things simple!)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',       // Leave empty for default XAMPP
    database: 'roommate_db'
});

async function startApp() {
    // 2. Create the table if it's missing
    const tableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            sleep_schedule VARCHAR(50),
            cleanliness VARCHAR(50),
            sociability VARCHAR(50)
        )
    `;
    await pool.query(tableQuery);
    console.log("Database table is ready!");

    // 3. API Route to ADD a new user
    app.post('/api/users', async (req, res) => {
        try {
            const data = req.body;
            
            // Insert user details into the database
            await pool.query(
                `INSERT INTO users (name, email, sleep_schedule, cleanliness, sociability) 
                 VALUES (?, ?, ?, ?, ?)`,
                [data.name, data.email, data.sleep_schedule, data.cleanliness, data.sociability]
            );
            
            res.json({ message: "Success!" });
        } catch (error) {
            res.status(500).json({ error: "Failed to save user. They might already exist." });
        }
    });

    // 4. API Route to GET all users
    app.get('/api/matches', async (req, res) => {
        try {
            // Fetch everything from the users table
            const [users] = await pool.query('SELECT * FROM users');
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Failed to load users." });
        }
    });

    // 5. Start the server
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

// Start everything up
startApp();