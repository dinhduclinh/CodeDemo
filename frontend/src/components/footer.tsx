import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.content}>
                    <div style={styles.brandSection}>
                        <h3 style={styles.brandTitle}>Demo Tech</h3>
                        <p style={styles.brandDescription}>
                            Device management system for tracking and borrowing equipment.
                        </p>
                    </div>
                    
                    <div style={styles.linksSection}>
                        <h4 style={styles.linksTitle}>Quick Links</h4>
                        <ul style={styles.linksList}>
                            <li><Link href="/" style={styles.link}>Home</Link></li>
                            <li><Link href="/devices" style={styles.link}>Devices</Link></li>
                            <li><Link href="/borrowings" style={styles.link}>Borrowings</Link></li>
                        </ul>
                    </div>
                    
                    <div style={styles.contactSection}>
                        <h4 style={styles.contactTitle}>Contact</h4>
                        <p style={styles.contactInfo}>Email: support@demotech.com</p>
                        <p style={styles.contactInfo}>Phone: (123) 456-7890</p>
                    </div>
                </div>
                
                <div style={styles.bottom}>
                    <p style={styles.copyright}>
                        © {new Date().getFullYear()} Demo Tech. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    footer: {
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        borderTop: '1px solid #1f2937',
        marginTop: 'auto',
    },
    container: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 16px 16px',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
    },
    brandSection: {
        flex: 1,
    },
    brandTitle: {
        fontSize: '20px',
        fontWeight: 700,
        margin: '0 0 8px 0',
        color: '#ffffff',
    },
    brandDescription: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0,
        lineHeight: 1.5,
    },
    linksSection: {
        flex: 1,
    },
    linksTitle: {
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 12px 0',
        color: '#ffffff',
    },
    linksList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    link: {
        color: '#cbd5e1',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'block',
        padding: '4px 0',
        transition: 'color 120ms ease',
    },
    contactSection: {
        flex: 1,
    },
    contactTitle: {
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 12px 0',
        color: '#ffffff',
    },
    contactInfo: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: '0 0 4px 0',
    },
    bottom: {
        borderTop: '1px solid #1f2937',
        paddingTop: '16px',
        textAlign: 'center',
    },
    copyright: {
        fontSize: '12px',
        color: '#64748b',
        margin: 0,
    },
};
