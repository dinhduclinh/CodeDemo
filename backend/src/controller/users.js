const User = require("../models/users");

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
      password,
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
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id || req.query.userId);

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

// @desc    Lấy tất cả users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

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

const getUserById = async (req, res) => {
  try {
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

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
};
