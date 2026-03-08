import { useNavigate } from 'react-router-dom'

export default function Navbar({ onLogout, search, onSearch, onNewRecipe }) {
  const navigate = useNavigate()

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoJa}>うまいる</span>
          <span style={styles.logoSub}>RECIPE BOOK</span>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.search}
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.newBtn} onClick={onNewRecipe}>
            + New Recipe
          </button>
          <button style={styles.planBtn} onClick={() => navigate('/meal-plan')}>
            📅 Meal Plan
          </button>
          <button style={styles.logoutBtn} onClick={onLogout}>
            ⎋
          </button>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    borderBottom: '1px solid #ebebeb',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  logo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    cursor: 'pointer',
    flexShrink: 0,
  },
  logoJa: {
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: 1,
    color: '#1a1a1a',
    fontFamily: "'Inter', sans-serif",
  },
  logoSub: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#aaa',
    fontWeight: 500,
  },
  searchWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#f5f5f3',
    borderRadius: 8,
    padding: '0 12px',
    gap: 8,
  },
  searchIcon: {
    fontSize: 13,
    opacity: 0.5,
  },
  search: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: 14,
    padding: '8px 0',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    color: '#1a1a1a',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  newBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  planBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    background: '#fff',
    color: '#555',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  logoutBtn: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    background: '#fff',
    color: '#555',
    fontSize: 16,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}