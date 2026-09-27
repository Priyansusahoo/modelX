import { Button, Card } from '../components/ui'
import { useAuth } from '../features/auth'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className={styles.container}>
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.welcomeTitle}>Welcome back, {user?.name ?? 'User'}</h1>
          <p className={styles.welcomeSubtitle}>
            Here is what's happening with your ModelX workspace today.
          </p>
        </div>

        <div className={styles.badgeGroup}>
          <span className={styles.statusBadge}>
            <span className={styles.statusDot} />
            System Live
          </span>
          <span className={styles.sessionBadge}>Session: Active</span>
        </div>
      </section>

      <section className={styles.metricsGrid}>
        <Card hoverable className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Products</span>
            <span className={styles.metricIcon}>📦</span>
          </div>
          <div className={styles.metricValue}>128</div>
          <span className={styles.metricTrend}>+12 added this week</span>
        </Card>

        <Card hoverable className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Saved Comparisons</span>
            <span className={styles.metricIcon}>⚖️</span>
          </div>
          <div className={styles.metricValue}>18</div>
          <span className={styles.metricTrend}>Across 4 categories</span>
        </Card>

        <Card hoverable className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Cart & Checkout</span>
            <span className={styles.metricIcon}>🛒</span>
          </div>
          <div className={styles.metricValue}>Ready</div>
          <span className={styles.metricTrend}>Pipeline active</span>
        </Card>

        <Card hoverable className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>API Gateway</span>
            <span className={styles.metricIcon}>⚡</span>
          </div>
          <div className={styles.metricValue}>99.98%</div>
          <span className={styles.metricTrend}>Latency &lt; 28ms</span>
        </Card>
      </section>

      <section className={styles.quickActionsSection}>
        <h2 className={styles.sectionHeading}>Quick Actions & Workflows</h2>
        <div className={styles.actionsGrid}>
          <Card className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Product Catalog</h3>
            <p className={styles.actionDescription}>
              Explore inventory, view detailed product specs, and manage attribute groups.
            </p>
            <Button variant="secondary" size="sm">
              Explore Products
            </Button>
          </Card>

          <Card className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Comparison Matrix</h3>
            <p className={styles.actionDescription}>
              Compare side-by-side technical specs, pricing models, and key feature sets.
            </p>
            <Button variant="secondary" size="sm">
              Create Comparison
            </Button>
          </Card>

          <Card className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Account & Team</h3>
            <p className={styles.actionDescription}>
              Manage organization settings, security preferences, and team credentials.
            </p>
            <Button variant="outline" size="sm">
              Manage Settings
            </Button>
          </Card>
        </div>
      </section>
    </div>
  )
}
