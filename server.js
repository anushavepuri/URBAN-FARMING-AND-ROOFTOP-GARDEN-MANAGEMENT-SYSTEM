
const express = require("express");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// HOME PAGE
// ===============================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// DATABASE TEST
// ===============================
app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "Database connected successfully!",
            data: rows
        });
    } catch (error) {
        console.error("Database test error:", error.message);
        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

// ===============================
// GET ALL PLANTS
// ===============================
app.get("/api/plants", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM plants ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error("Get plants error:", error.message);
        res.status(500).json({
            error: "Unable to load plants"
        });
    }
});

// ===============================
// ADD PLANT
// ===============================
app.post("/api/plants", async (req, res) => {
    try {
        const {
            name,
            type,
            water_requirement,
            sunlight_requirement
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Plant name is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO plants
            (name, type, water_requirement, sunlight_requirement)
            VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                type || null,
                water_requirement || null,
                sunlight_requirement || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Plant added successfully!",
            id: result.insertId
        });
    } catch (error) {
        console.error("Add plant error:", error.message);
        res.status(500).json({
            error: "Unable to add plant"
        });
    }
});

// ===============================
// DELETE PLANT
// ===============================
app.delete("/api/plants/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM plants WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Plant not found"
            });
        }

        res.json({
            success: true,
            message: "Plant deleted successfully!"
        });
    } catch (error) {
        console.error("Delete plant error:", error.message);
        res.status(500).json({
            error: "Unable to delete plant"
        });
    }
});

// ===============================
// GET ALL GARDENS
// ===============================
app.get("/api/gardens", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM gardens ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error("Get gardens error:", error.message);
        res.status(500).json({
            error: "Unable to load gardens"
        });
    }
});

// ===============================
// ADD GARDEN
// ===============================
app.post("/api/gardens", async (req, res) => {
    try {
        const { name, area, location } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Garden name is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO gardens (name, area, location)
            VALUES (?, ?, ?)`,
            [name.trim(), area || null, location || null]
        );

        res.status(201).json({
            success: true,
            message: "Garden added successfully!",
            id: result.insertId
        });
    } catch (error) {
        console.error("Add garden error:", error.message);
        res.status(500).json({
            error: "Unable to add garden"
        });
    }
});

// ===============================
// DELETE GARDEN
// ===============================
app.delete("/api/gardens/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM gardens WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Garden not found"
            });
        }

        res.json({
            success: true,
            message: "Garden deleted successfully!"
        });
    } catch (error) {
        console.error("Delete garden error:", error.message);
        res.status(500).json({
            error: "Unable to delete garden"
        });
    }
});

// ===============================
// GET ALL TASKS
// ===============================
app.get("/api/tasks", async (req, res) => {
    try {
        const [tasks] = await db.query(
            "SELECT * FROM tasks ORDER BY id DESC"
        );
        res.json(tasks);
    } catch (error) {
        console.error("Get tasks error:", error.message);
        res.status(500).json({
            error: "Unable to load tasks"
        });
    }
});

// ===============================
// ADD TASK
// ===============================
app.post("/api/tasks", async (req, res) => {
    try {
        const { title, description, due_date, status } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                error: "Task name is required"
            });
        }

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Completed"
        ];

        const taskStatus = status || "Pending";

        if (!allowedStatuses.includes(taskStatus)) {
            return res.status(400).json({
                error: "Invalid task status"
            });
        }

        const [result] = await db.query(
            `INSERT INTO tasks
            (title, description, due_date, status)
            VALUES (?, ?, ?, ?)`,
            [
                title.trim(),
                description || null,
                due_date || null,
                taskStatus
            ]
        );

        res.status(201).json({
            success: true,
            message: "Task added successfully!",
            id: result.insertId
        });
    } catch (error) {
        console.error("Add task error:", error.message);
        res.status(500).json({
            error: "Unable to add task"
        });
    }
});

// ===============================
// UPDATE TASK STATUS
// ===============================
app.patch("/api/tasks/:id", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid task status"
            });
        }

        const [result] = await db.query(
            "UPDATE tasks SET status = ? WHERE id = ?",
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task status updated successfully!"
        });
    } catch (error) {
        console.error("Update task error:", error.message);
        res.status(500).json({
            error: "Unable to update task"
        });
    }
});

// ===============================
// DELETE TASK
// ===============================
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM tasks WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task deleted successfully!"
        });
    } catch (error) {
        console.error("Delete task error:", error.message);
        res.status(500).json({
            error: "Unable to delete task"
        });
    }
});

// ===============================
// USER REGISTRATION
// ===============================
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                error: "Please fill in all fields."
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                error: "Enter a valid 10-digit phone number."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                error: "This email is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users
            (name, email, phone, password_hash)
            VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                normalizedEmail,
                phone,
                passwordHash
            ]
        );

        res.status(201).json({
            success: true,
            message: "Registration successful. You can now log in."
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "This email is already registered."
            });
        }

        res.status(500).json({
            error: "Registration failed. Please check the server."
        });
    }
});

// ===============================
// USER LOGIN
// ===============================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await db.query(
            `SELECT id, name, email, password_hash
             FROM users
             WHERE email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

// ===============================
// START SERVER
// ===============================
async function startServer() {
    try {
        await db.query("SELECT 1");

        console.log("MySQL connected successfully!");

        app.listen(PORT, () => {
            console.log(
                `Urban Farming System running at http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Database connection failed:",
            error.message
        );
    }
}

startServer();
