const User = require("../models/users");

// @desc    Đăng ký user mới
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Tạo user mới với role mặc định là 'user' nếu không được cung cấp
    const userData = {
      name,
      email,
      password, // Trong thực tế nên hash password
      role: role || "user",
    };

    const user = await User.create(userData);

    // Trả về thông tin user (không bao gồm password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: userResponse,
    });
  } catch (error) {
    console.error("Register error:", error);

    // Xử lý validation errors từ MongoDB
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Xử lý duplicate key error (email đã tồn tại)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
    });
  }
};

// @desc    Đăng nhập user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // So sánh password (đơn giản, không mã hóa)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Trả về thông tin user
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Lấy userId từ query parameter
    const userId = req.query.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không có thông tin xác thực",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// @desc    Lấy tất cả users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin từ header hoặc query
    const userRole = req.headers["x-user-role"] || req.query.userRole;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// @desc    Lấy user theo ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    // Kiểm tra quyền admin từ header hoặc query
    const userRole = req.headers["x-user-role"] || req.query.userRole;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    // Xử lý ObjectId không hợp lệ
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID user không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// @desc    Cập nhật user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin từ header hoặc query
    const userRole = req.headers["x-user-role"] || req.query.userRole;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    const { name, email, role } = req.body;

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ họ tên, email và vai trò",
      });
    }

    // Kiểm tra email đã tồn tại (trừ user hiện tại)
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.params.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Cập nhật user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật user thành công",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    // Xử lý validation errors từ MongoDB
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Xử lý duplicate key error (email đã tồn tại)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Xử lý ObjectId không hợp lệ
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID user không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật user",
    });
  }
};

// @desc    Xóa user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin từ header hoặc query
    const userRole = req.headers["x-user-role"] || req.query.userRole;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa user thành công",
      data: {},
    });
  } catch (error) {
    console.error("Delete user error:", error);

    // Xử lý ObjectId không hợp lệ
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID user không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa user",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
