const express = require('express');
const deviceRoutes = require('./device.router');
const userRoutes = require("./userRoutes");
const borrowingRoutes = require('./borrowing.router');
const router = express.Router();


router.use('/api/devices', deviceRoutes);
router.use('/api/borrowings', borrowingRoutes);
router.use("/api/users", userRoutes);

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API SEP490 đang hoạt động!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    availableRoutes: {
      users: {
        register: "POST /api/users/register",
        login: "POST /api/users/login",
        profile: "GET /api/users/me",
        list: "GET /api/users",
        getById: "GET /api/users/:id",
      },
      devices: {
        list: "GET /api/devices",
        create: "POST /api/devices",
        get: "GET /api/devices/:id",
      },
      borrowings: {
        list: "GET /api/borrowings",
        create: "POST /api/borrowings",
        get: "GET /api/borrowings/:id",
      },
    },
  });
});

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Health Check - OK",
    timestamp: new Date().toISOString(),
    status: {
      server: "running",
      routes: {
        users: "active",
        devices: "active",
        borrowings: "active",
      },
    },
  });
});

module.exports = router;
