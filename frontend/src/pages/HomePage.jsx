import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecipes, getTags } from '../api'
import RecipeCard from '../components/RecipeCard'
import Navbar from '../components/Navbar'

export default function HomePage({ onLogout }) {
  const [recipes, setRecipes] = useState([])
  const [tags, setTags] = useState([])
  const [activeTag, setActiveTag] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.q = search
      if (activeTag) params.tag = activeTag
      const res = await getRecipes(params)
      setRecipes(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTags().then(res => setTags(res.data))
  }, [])

  useEffect(() => {
    fetchRecipes()
  }, [search, activeTag])

  return (
    <div style={styles.page}>
      <Navbar
        onLogout={onLogout}
        search={search}
        onSearch={setSearch}
        onNewRecipe={() => navigate('/recipes/new')}
      />

      <div style={styles.content}>
        {/* Subtitle */}
        <p style={styles.subtitle}>Family favorites, all in one place</p>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div style={styles.tags}>
            <button
              style={activeTag === null ? styles.tagActive : styles.tag}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {tags.map(t => (
              <button
                key={t.id}
                style={activeTag === t.name ? styles.tagActive : styles.tag}
                onClick={() => setActiveTag(activeTag === t.name ? null : t.name)}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : recipes.length === 0 ? (
          <div style={styles.empty}>
            No recipes yet.{' '}
            <span style={styles.link} onClick={() => navigate('/recipes/new')}>
              Add your first one →
            </span>
          </div>
        ) : (
          <div style={styles.grid}>
            {recipes.map(r => (
              <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipes/${r.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#fafaf8',
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 32px',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    margin: '0 0 24px 0',
  },
  tags: {
    display: 'flex',
    gap: 8,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  tag: {
    padding: '6px 16px',
    borderRadius: 999,
    border: '1px solid #e5e5e5',
    background: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
    fontFamily: 'inherit',
  },
  tagActive: {
    padding: '6px 16px',
    borderRadius: 999,
    border: '1px solid #1a1a1a',
    background: '#1a1a1a',
    fontSize: 13,
    cursor: 'pointer',
    color: '#fff',
    fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 24,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    marginTop: 80,
  },
  link: {
    color: '#1a1a1a',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}