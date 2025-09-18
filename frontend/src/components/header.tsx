"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";
import { User } from "../types/user";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Thêm authentication logic
  useEffect(() => {
    const storedUserString = localStorage.getItem("user");
    if (storedUserString) {
      try {
        const parsedUser: User = JSON.parse(storedUserString);
        if (
          parsedUser &&
          typeof parsedUser.id === "string" &&
          parsedUser.id.length > 0 &&
          typeof parsedUser.name === "string" &&
          parsedUser.name.trim().length > 0 &&
          typeof parsedUser.email === "string" &&
          parsedUser.email.length > 0 &&
          (parsedUser.role === "admin" || parsedUser.role === "user")
        ) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const activePath = useMemo(() => router.pathname, [router.pathname]);

  // Thêm logout handler
  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    }
  };

  // Thêm authenticated navigation items
  const authNavItems = user
    ? [
        ...navItems,
        ...(user.role === "admin"
          ? [{ label: "Admin", href: "/admin/users" }]
          : []),
      ]
    : [{ label: "Home", href: "/" }];

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.brandArea}>
          <Link href={user ? "/" : "/"} style={styles.brandLink}>
            Demo Tech
          </Link>
        </div>

        {/* Thêm authentication state */}
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

            {/* Thêm user menu */}
            <div style={styles.userMenu}>
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
                  title={user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                >
                  {user.role === "admin" ? "A" : "U"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={styles.logoutButton}
                title="Đăng xuất"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m2-4v4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4v4M10 17L6 13m4 4l4-4" />
                </svg>
              </button>
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

            {/* Thêm auth buttons */}
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
  );
}

// Thêm styles mới cho authentication
declare module "react" {
  interface CSSProperties {
    userMenu?: React.CSSProperties;
    userInfo?: React.CSSProperties;
    userName?: React.CSSProperties;
    roleBadge?: React.CSSProperties;
    logoutButton?: React.CSSProperties;
    authButtons?: React.CSSProperties;
    loginButton?: React.CSSProperties;
    registerButton?: React.CSSProperties;
    loadingSpinner?: React.CSSProperties;
  }
}

// Cập nhật styles object
const styles: { [key: string]: React.CSSProperties } = {
  // ... existing styles giữ nguyên
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

  // Thêm styles mới cho authentication
  userMenu: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid rgba(55, 65, 81, 0.5)",
    backdropFilter: "blur(10px)",
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
  logoutButton: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "4px",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
    width: 24,
    height: 24,
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
  loadingSpinner: {
    color: "#94a3b8",
    fontSize: 14,
    padding: "8px 16px",
    backgroundColor: "rgba(31, 41, 55, 0.3)",
    borderRadius: 6,
    border: "1px solid rgba(55, 65, 81, 0.3)",
  },
};