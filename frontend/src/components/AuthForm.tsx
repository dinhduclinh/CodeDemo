"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    ...(type === "register" ? { name: "", confirmPassword: "" } : {}),
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      // Prepare request
      const requestBody =
        type === "register"
          ? {
              name: formData.name?.trim(),
              email: formData.email.trim(),
              password: formData.password,
            }
          : {
              email: formData.email.trim(),
              password: formData.password,
            };

      const endpoint =
        type === "login"
          ? "http://localhost:9999/api/users/login"
          : "http://localhost:9999/api/users/register";

      console.log(`[${type.toUpperCase()}] Calling:`, endpoint);
      console.log(`[${type.toUpperCase()}] Body:`, requestBody);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(`[${type.toUpperCase()}] Response:`, data);

      if (!response.ok) {
        throw new Error(
          data.message || `Lỗi ${type === "login" ? "đăng nhập" : "đăng ký"}`
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Thao tác thất bại");
      }

      if (!data.data) {
        throw new Error("Không nhận được dữ liệu phản hồi");
      }

      // Validate response data
      const userData: User = data.data;
      if (!userData.id || !userData.name || !userData.email || !userData.role) {
        throw new Error("Dữ liệu người dùng không hợp lệ");
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));

      setSuccess(
        type === "login" ? "Đăng nhập thành công!" : "Đăng ký thành công!"
      );

      // Redirect về home sau 1.5s
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error(`[${type.toUpperCase()}] Error:`, err);
      setError(err.message || "Có lỗi xảy ra");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegister
              ? "Nhập thông tin để tạo tài khoản mới"
              : "Nhập thông tin để truy cập hệ thống"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Name field cho register */}
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nhập họ và tên"
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
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nhập email"
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
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm password field cho register */}
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{success}</span>
              <div className="mt-2 text-xs">Chuyển hướng trong 2 giây...</div>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out"
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
                  {isRegister ? "Đang tạo..." : "Đang đăng nhập..."}
                </>
              ) : isRegister ? (
                "Đăng ký"
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>

          {/* Switch link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay"}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
