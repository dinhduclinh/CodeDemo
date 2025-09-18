"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types/user";

interface AuthFormProps {
  type: "login" | "register";
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    ...(type === "register" ? { name: "", confirmPassword: "" } : {}),
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Client-side validation
      if (type === "register") {
        if (!formData.name?.trim()) {
          setError("Vui lòng nhập họ tên");
          setLoading(false);
          return;
        }
        if (formData.name.trim().length < 2) {
          setError("Họ tên phải có ít nhất 2 ký tự");
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Mật khẩu xác nhận không khớp");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự");
          setLoading(false);
          return;
        }
      }

      if (!formData.email || !formData.password) {
        setError("Vui lòng nhập email và mật khẩu");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = type === "register"
        ? {
            name: formData.name?.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }
        : {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          };

      // ✅ FIX: Sử dụng Backend URL (port 9999) thay vì Next.js API routes
      const baseURL = typeof window !== 'undefined' ? 'http://localhost:9999' : '';
      const endpoint = `${baseURL}/api/users/${type}`;

      console.log(`[${type.toUpperCase()}] Calling API:`, endpoint);
      console.log(`[${type.toUpperCase()}] Request body:`, requestBody);

      // Make API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // ✅ FIX: Check response content type để debug
      const contentType = response.headers.get('content-type');
      console.log(`[${type.toUpperCase()}] Content-Type:`, contentType);
      
      if (!response.ok) {
        const text = await response.text();
        console.log(`[${type.toUpperCase()}] Response text:`, text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const errorMessage = data.message || data.error || `Lỗi ${type === "login" ? "đăng nhập" : "đăng ký"} (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[${type.toUpperCase()}] Response:`, data);

      if (!data.success) {
        throw new Error(data.message || "Thao tác thất bại");
      }

      if (!data.data) {
        throw new Error("Không nhận được dữ liệu người dùng từ server");
      }

      // Validate user data structure
      const userData: User = data.data;
      if (
        !userData.id ||
        !userData.name ||
        !userData.email ||
        !userData.role ||
        (userData.role !== "admin" && userData.role !== "user")
      ) {
        throw new Error("Dữ liệu người dùng không hợp lệ từ server");
      }

      // Call login through context (syncs all components immediately)
      login(userData);

      // Show success message
      const successMessage =
        data.message ||
        (type === "login" ? "Đăng nhập thành công!" : "Đăng ký thành công!");
      setSuccess(successMessage);

      // Clear form
      setFormData({
        email: "",
        password: "",
        ...(type === "register" ? { name: "", confirmPassword: "" } : {}),
      });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: any) {
      console.error(`[${type.toUpperCase()}] Error:`, err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isRegister = type === "register";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}
          </h2>
          <p className="text-gray-600">
            {isRegister
              ? "Nhập thông tin để tạo tài khoản mới"
              : "Nhập thông tin để truy cập hệ thống"}
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          onSubmit={handleSubmit}
        >
          {/* Name field for registration */}
          {isRegister && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                placeholder="Nhập họ và tên đầy đủ"
                value={formData.name || ""}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm password field for registration */}
          {isRegister && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md relative"
              role="alert"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                                    <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="block sm:inline text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md relative"
              role="alert"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <span className="block sm:inline text-sm font-medium">
                    {success}
                  </span>
                  <div className="mt-1 text-xs text-green-700">
                    Chuyển hướng trong 2 giây...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                                        <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>
                    {isRegister ? "Đang tạo tài khoản..." : "Đang đăng nhập..."}
                  </span>
                </>
              ) : (
                <span>{isRegister ? "Đăng ký" : "Đăng nhập"}</span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-gray-500 text-sm">hoặc</span>
            </div>
          </div>

          {/* Switch authentication method */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay"}
              </Link>
            </p>
          </div>
        </form>

        {/* Footer nhỏ cho auth page */}
        <div className="text-center text-xs text-gray-400 space-y-1 pt-6 border-t border-gray-200">
          <p className="text-gray-500">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
              Điều khoản dịch vụ
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              Chính sách bảo mật
            </Link>{" "}
            của chúng tôi
          </p>
          <p>Demo Tech © 2025 - Hệ thống quản lý thiết bị</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;