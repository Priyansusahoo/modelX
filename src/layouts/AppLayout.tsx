import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '../app/routes'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/hooks/useAuth'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.leftSection}>
            <div className={styles.brand}>
              <span className={styles.brandBadge}>MX</span>
              <span className={styles.brandName}>ModelX</span>
            </div>

            <nav className={styles.nav} aria-label="Main Navigation">
              <NavLink
                to={ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.activeNavLink : ''].filter(Boolean).join(' ')
                }
              >
                Dashboard
              </NavLink>
              <span className={styles.navLinkMuted} title="Coming soon in the next slice">
                Catalog
              </span>
              <span className={styles.navLinkMuted} title="Coming soon in the next slice">
                Compare
              </span>
              <span className={styles.navLinkMuted} title="Coming soon in the next slice">
                Cart
              </span>
            </nav>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{userInitial}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name ?? 'User'}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
