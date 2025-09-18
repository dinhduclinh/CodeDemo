"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Devices", href: "/devices" },
  { label: "Borrowings", href: "/borrowings" },
];

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const activePath = useMemo(() => router.pathname, [router.pathname]);

  const authNavItems = user
    ? [
        ...navItems,
        ...(user.role === "admin"
          ? [{ label: "Admin", href: "/admin" }]
          : []),
      ]
    : [{ label: "Home", href: "/" }];

  // THAY ĐỔI: handleLogout với modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.push("/login");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // THÊM: User dropdown menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.brandArea}>
            <Link href={user ? "/" : "/"} style={styles.brandLink}>
              Demo Tech
            </Link>
          </div>

          {loading ? (
            <div style={styles.loadingSpinner}>Đang tải...</div>
          ) : user ? (
            // Authenticated user navigation
            <>
              <nav aria-label="Main navigation">
                <ul style={styles.navList}>
                  {authNavItems.map((item) => {
                    const isActive = activePath === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          style={{
                            ...styles.navLink,
                            ...(isActive ? styles.navLinkActive : undefined),
                          }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* THAY ĐỔI: User menu với dropdown */}
              <div style={styles.userMenuContainer}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={styles.userMenuButton}
                  title="Tài khoản"
                >
                  <div style={styles.userInfo}>
                    <span style={styles.userName} title={`Chào ${user.name}`}>
                      {user.name.length > 12
                        ? `${user.name.substring(0, 12)}...`
                        : user.name}
                    </span>
                    <span
                      style={{
                        ...styles.roleBadge,
                        backgroundColor:
                          user.role === "admin" ? "#ef4444" : "#3b82f6",
                      }}
                      title={
                        user.role === "admin" ? "Quản trị viên" : "Người dùng"
                      }
                    >
                      {user.role === "admin" ? "A" : "U"}
                    </span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transition: "transform 0.2s ease",
                      transform: userMenuOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* THÊM: User dropdown menu */}
                {userMenuOpen && (
                  <div style={styles.userDropdown}>
                    <Link
                      href="/dashboard"
                      style={styles.dropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div style={styles.dashboardIcon}>📊</div>
                      <span>Dashboard</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin/users"
                        style={styles.dropdownItem}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div style={styles.adminIcon}>👥</div>
                        <span>Quản lý người dùng</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      style={styles.dropdownItem}
                      className="w-full text-left"
                    >
                      <div style={styles.logoutIcon}>⏻</div>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Unauthenticated navigation
            <>
              <nav aria-label="Main navigation">
                <ul style={styles.navList}>
                  {authNavItems.map((item) => {
                    const isActive = activePath === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          style={{
                            ...styles.navLink,
                            ...(isActive ? styles.navLinkActive : undefined),
                          }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div style={styles.authButtons}>
                <Link href="/login" style={styles.loginButton}>
                  Đăng nhập
                </Link>
                <Link href="/register" style={styles.registerButton}>
                  Đăng ký
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      {/* THÊM: Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay} onClick={handleCancelLogout}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIcon}>⚠️</div>
              <h3 style={styles.modalTitle}>Xác nhận đăng xuất</h3>
            </div>

            <div style={styles.modalBody}>
              <p style={styles.modalDescription}>
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản{" "}
                <strong>{user?.name}</strong>?
              </p>
              <p style={styles.modalSubtext}>
                Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống.
              </p>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={handleCancelLogout}
                style={styles.modalCancelButton}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLogout}
                style={styles.modalConfirmButton}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    borderBottom: "1px solid #1f2937",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "12px 16px",
    gap: 16,
  },
  brandArea: {
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 0.2,
  },
  brandLink: {
    color: "inherit",
    textDecoration: "none",
  },
  navList: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 6,
    transition: "background-color 120ms ease, color 120ms ease",
  },
  navLinkActive: {
    color: "#ffffff",
    backgroundColor: "#1f2937",
  },
  loadingSpinner: {
    color: "#94a3b8",
    fontSize: 14,
    padding: "8px 16px",
    backgroundColor: "rgba(31, 41, 55, 0.3)",
    borderRadius: 6,
    border: "1px solid rgba(55, 65, 81, 0.3)",
  },

  // THAY ĐỔI: User menu styles
  userMenuContainer: {
    position: "relative",
  },
  userMenuButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s ease",
    color: "#e2e8f0",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: 500,
    maxWidth: "140px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  roleBadge: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    flexShrink: 0,
  },
  userDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    minWidth: "200px",
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    marginTop: "4px",
    zIndex: 30,
    overflow: "hidden",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: 14,
    transition: "all 0.2s ease",
    borderBottom: "1px solid #374151",
  },
  dashboardIcon: {
    width: 20,
    height: 20,
    borderRadius: "4px",
    backgroundColor: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "white",
    flexShrink: 0,
  },
  adminIcon: {
    width: 20,
    height: 20,
    borderRadius: "4px",
    backgroundColor: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "white",
    flexShrink: 0,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    borderRadius: "4px",
    backgroundColor: "#ef4444",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "white",
    flexShrink: 0,
  },
  authButtons: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  loginButton: {
    color: "#60a5fa",
    textDecoration: "none",
    padding: "6px 12px",
    border: "1px solid #60a5fa",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  registerButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  // THÊM: Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    backdropFilter: "blur(4px)",
  } as React.CSSProperties,
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    width: "90%",
    maxWidth: "400px",
    maxHeight: "90vh",
    overflow: "hidden",
  } as React.CSSProperties,
  modalHeader: {
    padding: "24px 24px 0",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  } as React.CSSProperties,
  modalIcon: {
    fontSize: "24px",
    lineHeight: 1,
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
  } as React.CSSProperties,
  modalBody: {
    padding: "0 24px 24px",
  } as React.CSSProperties,
  modalDescription: {
    fontSize: "16px",
    color: "#374151",
    lineHeight: "1.5",
    marginBottom: "8px",
  } as React.CSSProperties,
  modalSubtext: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.4",
  } as React.CSSProperties,
  modalActions: {
    display: "flex",
    gap: "12px",
    padding: "0 24px 24px",
    justifyContent: "flex-end",
    borderTop: "1px solid #e5e7eb",
  } as React.CSSProperties,
  modalCancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  modalConfirmButton: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
};
