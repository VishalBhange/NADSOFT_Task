const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE student
router.post("/", async (req, res) => {
  try {
    const { name, email, age, marks } = req.body;

    const studentResult = await pool.query(
      "INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name, email, age]
    );

    const student = studentResult.rows[0];

    if (marks && marks.length > 0) {
      for (let item of marks) {
        await pool.query(
          "INSERT INTO marks (student_id, subject, marks) VALUES ($1, $2, $3)",
          [student.id, item.subject, item.marks]
        );
      }
    }

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all students with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const offset = (page - 1) * limit;

    const students = await pool.query(
      "SELECT * FROM students ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM students"
    );

    const total = parseInt(totalResult.rows[0].count);

    res.json({
      data: students.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single student with marks
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const studentResult = await pool.query(
      "SELECT * FROM students WHERE id=$1",
      [id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const marksResult = await pool.query(
      "SELECT * FROM marks WHERE student_id=$1",
      [id]
    );

    res.json({
      ...studentResult.rows[0],
      marks: marksResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE student
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const result = await pool.query(
      "UPDATE students SET name=$1, email=$2, age=$3 WHERE id=$4 RETURNING *",
      [name, email, age, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student updated successfully",
      student: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE student
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM students WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;