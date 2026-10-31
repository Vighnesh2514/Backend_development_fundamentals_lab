// Task 4-7: the same server rewritten with Express.
// Run with: npm start  (listens on port 3000, or on $PORT when deployed)
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// GET / -> plain welcome text
app.get("/", (req, res) => {
  res.status(200).send("Welcome to Lab 1: Node.js and Express server");
});

// GET /about -> JSON with my name and section
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "P. Vighnesh",
    section: "CSE FSD 2B 309"
  });
});

// GET /time -> current date and time using new Date()
app.get("/time", (req, res) => {
  res.status(200).json({
    currentTime: new Date()
  });
});

// Any other path -> 404
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

// Listen only when this file is run directly (Vercel imports the app instead)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
