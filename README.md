# Backend Development Fundamentals — Lab Reports

**P. Vighnesh** · Registration number **252U1R7075** · Section **CSE FSD 2B 309**

Course: Backend Development Fundamentals — Year II Term II — Aurora
Faculty: Joel Prashanth D

This repository holds one folder per lab for the course. Each folder is a self-contained project with its own `README.md`, source code, and screenshots.

## Lab index

| Lab | Title | Topics | Folder |
|---|---|---|---|
| Lab 01 | Node.js and Express server | Node.js `http` module, Express routing, status codes, 404 handling | [`lab-01/`](./lab-01) |

## Running any lab

```bash
cd lab-01
npm install
npm start
```

Each lab's `README.md` documents its own endpoints, environment variables and screenshots.

## Rules followed in every lab

- `node_modules` is never committed; each folder has a `.gitignore`.
- `.env` files are never committed and contain no real values in the repository.
- Every route returns the correct HTTP status code.
- Database queries use parameterised statements, never string concatenation with user input.
