"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface ModalState {
  show: boolean;
  userId: string;
  action: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

const AdminUsers: React.FC = () => {
  const { user: authUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "123456",
    role: "user",
  });
  const [modal, setModal] = useState<ModalState>({ show: false, userId: "", action: "" });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 5, // 5 users per page
    totalItems: 0,
  });
  const router = useRouter();

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!authUser || authUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [authUser, router]);

  // Lấy tất cả users (không phân trang backend)
  const fetchAllUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:9999/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(errorData.message || "Lỗi khi lấy danh sách users");
      }
      const data = await response.json();
      if (data.success) {
        const users = data.data || [];
        setAllUsers(users);
        setPagination(prev => ({
          ...prev,
          totalItems: users.length,
          totalPages: Math.ceil(users.length / prev.itemsPerPage),
          currentPage: prev.currentPage > Math.ceil(users.length / prev.itemsPerPage) ? 1 : prev.currentPage,
        }));
      } else {
        throw new Error(data.message || "Không thể lấy danh sách users");
      }
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy users cho trang hiện tại
  const getCurrentPageUsers = (): User[] => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return allUsers.slice(startIndex, endIndex);
  };

  // Kiểm tra user có thể chỉnh sửa không
  const canEditUser = (user: User): boolean => {
    // Không thể chỉnh sửa bất kỳ admin account nào (kể cả chính mình)
    return user.role !== "admin";
  };

  // Kiểm tra user có thể xóa không
  const canDeleteUser = (user: User): boolean => {
    // Không thể xóa bất kỳ admin account nào (kể cả chính mình)
    return user.role !== "admin";
  };

  // Lấy chi tiết user
  const fetchUserById = async (userId: string): Promise<void> => {
    // Kiểm tra quyền trước khi fetch
    const userToEdit = allUsers.find(user => user._id === userId);
    if (!userToEdit || !canEditUser(userToEdit)) {
      toast.error("Bạn không thể chỉnh sửa tài khoản admin", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      setError("");
      const response = await fetch(`http://localhost:9999/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(errorData.message || "Lỗi khi lấy thông tin user");
      }
      const data = await response.json();
      if (data.success) {
        setEditingUser(data.data);
        setFormData({
          name: data.data.name,
          email: data.data.email,
          password: "",
          role: data.data.role,
        });
        setShowForm(true);
      } else {
        throw new Error(data.message || "Không thể lấy thông tin user");
      }
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error fetching user:", err);
    }
  };

  // Xử lý form input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = (): void => {
    setFormData({ name: "", email: "", password: "123456", role: "user" });
    setEditingUser(null);
    setShowForm(false);
    setError("");
  };

  // Tạo/Cập nhật user
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    // Kiểm tra nếu đang edit admin account
    if (editingUser && !canEditUser(editingUser)) {
      toast.error("Bạn không thể chỉnh sửa tài khoản admin", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      setError("");
      let response: Response;
      if (editingUser) {
        response = await fetch(`http://localhost:9999/api/users/${editingUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": "admin",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
          }),
        });
      } else {
        response = await fetch("http://localhost:9999/api/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(errorData.message || "Lỗi khi lưu thông tin");
      }
      const data = await response.json();
      if (data.success) {
        resetForm();
        await fetchAllUsers(); // Reload all users để cập nhật pagination
        toast.success(editingUser ? "Cập nhật thành công!" : "Tạo user thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        throw new Error(data.message || "Không thể lưu thông tin");
      }
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error saving user:", err);
    }
  };

  // Xóa user
  const handleDelete = async (userId: string): Promise<void> => {
    // Kiểm tra quyền trước khi xóa
    const userToDelete = allUsers.find(user => user._id === userId);
    if (!userToDelete || !canDeleteUser(userToDelete)) {
      toast.error("Bạn không thể xóa tài khoản admin", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      closeModal();
      return;
    }
    try {
      setError("");
      const response = await fetch(`http://localhost:9999/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(errorData.message || "Lỗi khi xóa user");
      }
      const data = await response.json();
      if (data.success) {
        setModal({ show: false, userId: "", action: "" });
        await fetchAllUsers(); // Reload all users để cập nhật pagination
        toast.success("Xóa user thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        throw new Error(data.message || "Không thể xóa user");
      }
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error deleting user:", err);
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = (): void => {
    resetForm();
  };

  // Toggle form
  const toggleForm = (): void => {
    setShowForm(!showForm);
  };

  // Close modal
  const closeModal = (): void => {
    setModal({ show: false, userId: "", action: "" });
  };

  // Pagination handlers
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const getVisiblePageNumbers = (): number[] => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift(-1); // ellipsis
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(-1); // ellipsis
    }
    if (pagination.totalPages > 1) {
      range.unshift(1);
      if (range.length > 1 && range[range.length - 1] !== totalPages) {
        range.push(totalPages);
      }
    }
    return range;
  };

  // Lấy users hiển thị cho trang hiện tại
  const currentPageUsers = getCurrentPageUsers();

  useEffect(() => {
    if (authUser?.role === "admin") {
      fetchAllUsers();
    }
  }, [authUser]);

  if (loading && allUsers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách users...</p>
        </div>
      </div>
    );
  }

  if (!authUser || authUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Truy cập bị từ chối</h1>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Users</h1>
              <p className="mt-2 text-gray-600">Quản lý danh sách người dùng hệ thống</p>
            </div>
            <div className="text-sm text-gray-500">
              Đăng nhập với: {authUser.name} ({authUser.role})
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={toggleForm}
            className="inline-flex items-center px-4 py-2 rounded-md font-medium transition-all shadow-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm User
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <span>
              Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} -{" "}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}{" "}
              của {pagination.totalItems} users
            </span>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-all shadow-sm border border-gray-600"
          >
            Quay lại Dashboard
          </button>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <UserCircleIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
                      </h2>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <UserIcon className="h-4 w-4 inline mr-2 text-gray-600" />
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <EnvelopeIcon className="h-4 w-4 inline mr-2 text-gray-600" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="Nhập email"
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <LockClosedIcon className="h-4 w-4 inline mr-2 text-gray-600" />
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Nhập mật khẩu (mặc định: 123456)"
                      />
                      <p className="mt-1 text-xs text-gray-600">
                        Mật khẩu mặc định là 123456, user có thể đổi sau khi đăng nhập
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all shadow-sm border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {editingUser ? "Cập nhật" : "Tạo mới"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2.5 rounded-lg font-medium transition-all shadow-sm border border-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách Users
              </h3>
              <div className="text-sm text-gray-500">
                {currentPageUsers.length} / {pagination.totalItems} users
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900">Chưa có user nào</p>
                        <p className="text-sm text-gray-500">Hãy thêm user đầu tiên!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPageUsers.map((user: User, index: number) => {
                    const rowNumber = (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1;
                    const canEdit = canEditUser(user);
                    const canDelete = canDeleteUser(user);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rowNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <UserCircleIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => canEdit ? fetchUserById(user._id) : null}
                              disabled={!canEdit}
                              className={`p-2 rounded-lg transition-all ${
                                canEdit
                                  ? "text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                  : "text-gray-400 cursor-not-allowed bg-gray-100"
                              }`}
                              title={canEdit ? "Sửa" : "Không thể chỉnh sửa tài khoản admin"}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                canDelete
                                  ? setModal({
                                      show: true,
                                      userId: user._id,
                                      action: "delete",
                                    })
                                  : null
                              }
                              disabled={!canDelete}
                              className={`p-2 rounded-lg transition-all ${
                                canDelete
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-gray-400 cursor-not-allowed bg-gray-100"
                              }`}
                              title={canDelete ? "Xóa" : "Không thể xóa tài khoản admin"}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Trang <span className="font-medium">{pagination.currentPage}</span> /{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <ChevronDoubleLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  {getVisiblePageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === -1 ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            page === pagination.currentPage
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.currentPage === pagination.totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.currentPage === pagination.totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <ChevronDoubleRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchAllUsers}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Đang tải..." : "Làm mới danh sách"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <TrashIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Xóa user này?</h4>
                  <p className="text-sm text-gray-700">
                    Thao tác này không thể hoàn tác. User sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-all shadow-sm"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDelete(modal.userId)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AdminUsers;