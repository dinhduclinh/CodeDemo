const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
} = require("../controller/users");

// Public routes - BỎ /api prefix
router.post("/register", registerUser); // ← /api/users/register
router.post("/login", loginUser); // ← /api/users/login

// Private routes
router.get("/me", getMe); // ← /api/users/me
router.get("/", getAllUsers); // ← /api/users (lấy tất cả)
router.get("/:id", getUserById); // ← /api/users/:id

// Test route để debug
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "User routes working!",
    endpoints: {
      register: "POST /api/users/register",
      login: "POST /api/users/login",
      me: "GET /api/users/me",
      list: "GET /api/users",
      getById: "GET /api/users/:id",
    },
  });
});

module.exports = router;
