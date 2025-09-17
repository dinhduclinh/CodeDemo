import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

type NavItem = {
    label: string;
    href: string;
};

const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Devices', href: '/devices' },
    { label: 'Borrowings', href: '/borrowings' },
];

export default function Header() {
    const router = useRouter();

    const activePath = useMemo(() => router.pathname, [router.pathname]);

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div style={styles.brandArea}>
                    <Link href="/" style={styles.brandLink}>
                        Demo Tech
                    </Link>
                </div>

                <nav aria-label="Main navigation">
                    <ul style={styles.navList}>
                        {navItems.map((item) => {
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
            </div>
        </header>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        borderBottom: '1px solid #1f2937',
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '12px 16px',
        gap: 16,
    },
    brandArea: {
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: 0.2,
    },
    brandLink: {
        color: 'inherit',
        textDecoration: 'none',
    },
    navList: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    navLink: {
        color: '#cbd5e1',
        textDecoration: 'none',
        padding: '8px 10px',
        borderRadius: 6,
        transition: 'background-color 120ms ease, color 120ms ease',
    },
    navLinkActive: {
        color: '#ffffff',
        backgroundColor: '#1f2937',
    },
};


