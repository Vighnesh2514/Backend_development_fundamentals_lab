// Lab 2: SQLite database and CRUD routes.
// Run with: npm run dev   (nodemon, restarts on every change)
//           npm start     (plain node)
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// Hosted platforms give the app a read-only filesystem, except for /tmp,
// so the database is copied there once and all writes go to that copy.
const isDeployed = Boolean(process.env.VERCEL);
const dbPath = isDeployed
  ? path.join("/tmp", "books.db")
  : path.join(__dirname, "books.db");

if (isDeployed && !fs.existsSync(dbPath)) {
  fs.copyFileSync(path.join(__dirname, "books.db"), dbPath);
}

let db = null;

// Opens the database first, and only starts listening once that worked.
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    const PORT = process.env.PORT || 3000;
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    process.exit(1);
  }
};

// A book id must be a positive whole number.
const isValidId = (value) => /^\d+$/.test(value) && Number(value) > 0;

// Every book field is required and must have the right type.
const validateBook = (body) => {
  const { title, author, price, pages } = body;

  if (typeof title !== "string" || title.trim() === "") return "title is required";
  if (typeof author !== "string" || author.trim() === "") return "author is required";
  if (typeof price !== "number" || price < 0) return "price must be a number";
  if (typeof pages !== "number" || pages <= 0) return "pages must be a number";

  return null;
};

// GET /books/ -> all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all("SELECT * FROM book ORDER BY id;");
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// GET /books/:bookId/ -> one book
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidId(bookId)) {
    return response.status(400).json({ error: "Book id must be a positive whole number" });
  }

  try {
    const book = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);

    if (!book) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// POST /books/ -> add a book
app.post("/books/", async (request, response) => {
  const invalid = validateBook(request.body);

  if (invalid) {
    return response.status(400).json({ error: invalid });
  }

  try {
    const { title, author, price, pages } = request.body;
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
      [title, author, price, pages]
    );

    response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// PUT /books/:bookId/ -> replace the details of a book
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidId(bookId)) {
    return response.status(400).json({ error: "Book id must be a positive whole number" });
  }

  const invalid = validateBook(request.body);

  if (invalid) {
    return response.status(400).json({ error: invalid });
  }

  try {
    const existing = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);

    if (!existing) {
      return response.status(404).json({ error: "Book not found" });
    }

    const { title, author, price, pages } = request.body;
    await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;",
      [title, author, price, pages, bookId]
    );

    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// DELETE /books/:bookId/ -> remove a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidId(bookId)) {
    return response.status(400).json({ error: "Book id must be a positive whole number" });
  }

  try {
    const existing = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);

    if (!existing) {
      return response.status(404).json({ error: "Book not found" });
    }

    await db.run("DELETE FROM book WHERE id = ?;", [bookId]);

    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Unknown route -> 404
app.use((request, response) => {
  response.status(404).json({ error: "Route not found" });
});

// Malformed JSON in the request body -> 400 as JSON instead of an HTML page
app.use((error, request, response, next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ error: "Request body must be valid JSON" });
  }
  next(error);
});

initializeDBAndServer();

module.exports = app;
