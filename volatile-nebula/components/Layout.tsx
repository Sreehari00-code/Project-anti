import Navbar from './Navbar';
import styles from './Layout.module.css';
import Head from 'next/head';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <>
            <Head>
                <title>GuardianLines | Empowering NGOs</title>
                <meta name="description" content="Connecting communities with NGO events and programs." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.main}>
                <div className={styles.background}>
                    <div className={`${styles.blob} ${styles.blob1}`} />
                    <div className={`${styles.blob} ${styles.blob2}`} />
                </div>

                <Navbar />

                <main className={styles.content}>
                    {children}
                </main>

                {/* Footer could go here */}
            </div>
        </>
    );
}
