const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
} = require("../controller/users");

router.post("/register", registerUser); 
router.post("/login", loginUser); 

// Private routes
router.get("/me", getMe); 
router.get("/", getAllUsers); 
router.get("/:id", getUserById); 

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
