const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

// API endpoint to receive attendance logs
app.post("/api/attendance", (req, res) => {
  const { studentId, confidence, timestamp } = req.body;
  console.log(`Attendance: ${studentId} at ${timestamp} (conf: ${confidence})`);
  res.json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
