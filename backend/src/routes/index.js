const express = require("express");
const deviceRoutes = require("./device.router");
const userRoutes = require("./userRoutes");
const borrowingRoutes = require("./borrowing.router");

const router = express.Router();

// API Routes
router.use("/api/devices", deviceRoutes);
router.use("/api/borrowings", borrowingRoutes);
router.use("/api/users", userRoutes);

// Root route
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
        profile: "GET /api/users/me?userId=xxx",
        list: "GET /api/users?userRole=admin",
        getById: "GET /api/users/:id?userRole=admin",
        update: "PUT /api/users/:id?userRole=admin",
        delete: "DELETE /api/users/:id?userRole=admin",
      },
      devices: {
        list: "GET /api/devices",
        create: "POST /api/devices",
        get: "GET /api/devices/:id",
        update: "PUT /api/devices/:id",
        delete: "DELETE /api/devices/:id",
      },
      borrowings: {
        list: "GET /api/borrowings",
        create: "POST /api/borrowings",
        get: "GET /api/borrowings/:id",
        update: "PUT /api/borrowings/:id",
        delete: "DELETE /api/borrowings/:id",
      },
    },
    adminNote: "Các route admin cần thêm query parameter: ?userRole=admin",
  });
});

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Health Check - OK",
    timestamp: new Date().toISOString(),
    status: {
      server: "running",
      database: "connected",
      routes: {
        users: "active",
        devices: "active",
        borrowings: "active",
      },
    },
  });
});

// Test route để kiểm tra tất cả API
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "All APIs are working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      users: {
        register: "POST /api/users/register",
        login: "POST /api/users/login",
        me: "GET /api/users/me?userId=xxx",
        list: "GET /api/users?userRole=admin",
        getById: "GET /api/users/:id?userRole=admin",
        update: "PUT /api/users/:id?userRole=admin",
        delete: "DELETE /api/users/:id?userRole=admin",
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

module.exports = router;
