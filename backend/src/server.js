require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const searchRouter = require("./routes/search");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// Protects the Google Search quota and prevents abuse of this endpoint.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many searches. Please wait a moment." },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/search", limiter, searchRouter);

app.use((req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Route not found." });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`LinkedIn Profile Finder API listening on port ${PORT}`);
});
