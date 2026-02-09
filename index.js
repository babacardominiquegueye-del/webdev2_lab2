const express = require("express");
const app = express();

app.use(express.json());

let tasks = [];
let idCounter = 1;

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== "Bearer secret123") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const validateTask = (req, res, next) => {
  const { title, completed, priority } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Invalid title" });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "Invalid completed value" });
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority" });
  }

  next();
};

app.post("/tasks", authMiddleware, validateTask, (req, res) => {
  const task = {
    id: idCounter++,
    title: req.body.title,
    completed: req.body.completed ?? false,
    priority: req.body.priority
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.get("/tasks", authMiddleware, (req, res) => {
  let result = tasks;

  if (req.query.completed) {
    result = result.filter(
      t => t.completed === (req.query.completed === "true")
    );
  }

  if (req.query.priority) {
    result = result.filter(
      t => t.priority === req.query.priority
    );
  }

  res.json(result);
});

app.put("/tasks/:id", authMiddleware, validateTask, (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.title = req.body.title;
  task.completed = req.body.completed;
  task.priority = req.body.priority;

  res.json(task);
});

app.delete("/tasks/:id", authMiddleware, (req, res) => {
  const index = tasks.findIndex(t => t.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Server error" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});