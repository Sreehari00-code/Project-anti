import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>GuardianLines | Home</title>
      </Head>

      <div className={styles.hero}>
        <h1 className={styles.title}>
          Empowering NGOs to <br />
          <span className="gradient-text">Change the World</span>
        </h1>

        <p className={styles.subtitle}>
          Discover impactful events, connect with changemakers, and support causes that matter.
          GuardianLines is your gateway to making a difference.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/events" className="cta" style={{ background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 'bold' }}>
            Explore Events
          </Link>
          <Link href="/about" className="cta home-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 'bold', backdropFilter: 'blur(10px)' }}>
            Learn More
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} glass`}>
            <h3>Community Events &rarr;</h3>
            <p>Find local gatherings, workshops, and seminars organized by trusted NGOs.</p>
          </div>

          <div className={`${styles.card} glass`}>
            <h3>Volunteer &rarr;</h3>
            <p>Connect with organizations that need your skills and passion to drive change.</p>
          </div>

          <div className={`${styles.card} glass`}>
            <h3>Impact Donations &rarr;</h3>
            <p>Securely donate to causes you care about with transparent tracking.</p>
          </div>
        </div>
      </div>
    </>
  );
}
