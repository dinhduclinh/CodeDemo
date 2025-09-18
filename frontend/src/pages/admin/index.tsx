import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const AdminDashboard: React.FC = () => {
  const router = useRouter();

  const menuItems = [
    {
      name: "Quản lý Users",
      href: "/admin/users",
      icon: "👥",
      description: "Quản lý danh sách người dùng hệ thống",
    },
    {
      name: "Quản lý Devices",
      href: "/admin/devices",
      icon: "📱",
      description: "Quản lý thiết bị trong hệ thống",
    },
    {
      name: "Quản lý Borrowings",
      href: "/admin/borrowings",
      icon: "📚",
      description: "Quản lý lịch sử mượn/trả thiết bị",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Chào mừng bạn đến với bảng điều khiển quản trị
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link href={item.href} key={item.name}>
              <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats (Optional) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng Users
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        12
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng Devices
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        45
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng Borrowings
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        23
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
