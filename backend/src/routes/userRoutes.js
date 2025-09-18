const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controller/users");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes
router.get("/me", getMe);

// Admin routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "User routes working!",
    endpoints: {
      register: "POST /api/users/register",
      login: "POST /api/users/login",
      me: "GET /api/users/me?userId=xxx",
      list: "GET /api/users (with x-user-role: admin header)",
      getById: "GET /api/users/:id (with x-user-role: admin header)",
      update: "PUT /api/users/:id (with x-user-role: admin header)",
      delete: "DELETE /api/users/:id (with x-user-role: admin header)",
    },
  });
});

module.exports = router;
