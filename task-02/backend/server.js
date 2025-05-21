const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Database connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'tododb',
    connectionLimit: 5,
    multipleStatements: true, // Allowing execution of multiple SQL statements in a single query.
    trace: true, // Enabling SQL query tracing in non-production environments.
    insertIdAsNumber: true, // Ensuring that the 'insertId' field in the response is of type number.
    decimalAsNumber: true, // Interpreting decimal data types as numbers.
    bigIntAsNumber: true, // Interpreting bigint data types as numbers.
    checkDuplicate: false, // Disabling automatic checks for duplicate entries.
    permitSetMultiParamEntries: true, // Allowing multiple parameter entries for SET operations in queries.
});

// Connect and initialize database
async function initializeDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('Connected to MariaDB');

        // Create todos table if it doesn't exist
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        await conn.query(createTableQuery);
        console.log('Todos table created or already exists');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        if (conn) conn.release(); // Release connection back to pool
    }
}

// Initialize database on startup
initializeDatabase();

// API Routes

// Get all todos
app.get('/api/todos', async (_req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const results = await conn.query('SELECT * FROM todos ORDER BY created_at DESC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Error fetching todos' });
    } finally {
        if (conn) conn.release();
    }
});

// Create a new todo
app.post('/api/todos', async (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task is required' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('INSERT INTO todos (task) VALUES (?)', [task]);

        const newTodo = {
            id: result.insertId,
            task,
            completed: false,
        };

        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ error: 'Error creating todo' });
    } finally {
        if (conn) conn.release();
    }
});

// Update a todo (toggle completion)
app.put('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
        res.json({ id, completed });
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: 'Error updating todo' });
    } finally {
        if (conn) conn.release();
    }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM todos WHERE id = ?', [id]);
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Error deleting todo' });
    } finally {
        if (conn) conn.release();
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
