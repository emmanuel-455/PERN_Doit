import express from "express";
import cors from "cors";
import pkg from "pg"; // Import pg module
import dotenv from "dotenv"

const { Pool } = pkg; // Destructure Pool from pg

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
dotenv.config()

// Create a PostgreSQL pool
const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORTER,
  database: process.env.DATABASE
});

// Routes
app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodos = await pool.query(
      "INSERT INTO todo (description) VALUES($1) RETURNING *",
      [description]
    );
    res.json(newTodos.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);
    res.json(todo.rows[0]); // Send the retrieved todo data back to the client
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body
    const updateTodo = await pool.query("UPDATE todo SET description = $1 WHERE todo_id = $2", [description, id])
    res.json("Todo has been updated")
  } catch (err) {
    console.error(err.message)
  }
})

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id])
  res.json("Todo has been deleted")
})

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
