import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Example API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
