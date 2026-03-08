import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipe, deleteRecipe, getNotes, createNote } from '../api'
import Navbar from '../components/Navbar'

export default function RecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [servings, setServings] = useState(null)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRecipe(id), getNotes(id)]).then(([rRes, nRes]) => {
      setRecipe(rRes.data)
      setServings(rRes.data.servings)
      setNotes(nRes.data)
      setLoading(false)
    })
  }, [id])

  const scaleAmount = (amount) => {
    if (!amount || !recipe) return amount
    return +(amount * servings / recipe.servings).toFixed(2)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this recipe?')) return
    await deleteRecipe(id)
    navigate('/')
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    const res = await createNote(id, newNote)
    setNotes([res.data, ...notes])
    setNewNote('')
  }

  const handlePrint = () => window.print()

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.page}>
      <Navbar search="" onSearch={() => {}} onLogout={() => {}} onNewRecipe={() => navigate('/recipes/new')} />

      <div style={styles.content}>
        {/* Back */}
        <button style={styles.back} onClick={() => navigate('/')}>← All Recipes</button>

        <div style={styles.layout}>
          {/* Left column */}
          <div style={styles.main}>
            {/* Header */}
            <div style={styles.header}>
              <div>
                {recipe.title_ja && <h1 style={styles.titleJa}>{recipe.title_ja}</h1>}
                <h2 style={styles.titleEn}>{recipe.title}</h2>
              </div>
              <div style={styles.headerActions}>
                <button style={styles.iconBtn} onClick={() => navigate(`/recipes/${id}/edit`)}>✏️</button>
                <button style={styles.iconBtn} onClick={handlePrint}>🖨️</button>
                <button style={styles.iconBtn} onClick={handleDelete}>🗑️</button>
              </div>
            </div>

            {/* Meta */}
            <div style={styles.meta}>
              {recipe.tags?.map(t => (
                <span key={t.id} style={styles.tag}>{t.name}</span>
              ))}
              {(recipe.prep_time || recipe.cook_time) && (
                <span style={styles.metaText}>
                  ⏱ {recipe.prep_time ? `Prep ${recipe.prep_time} min` : ''}
                  {recipe.prep_time && recipe.cook_time ? ' + ' : ''}
                  {recipe.cook_time ? `Cook ${recipe.cook_time} min` : ''}
                </span>
              )}
            </div>

            {/* Photo */}
            {recipe.photo_url && (
              <img src={recipe.photo_url} alt={recipe.title} style={styles.photo} />
            )}

            {/* Description */}
            {recipe.description && (
              <p style={styles.description}>{recipe.description}</p>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <>
                <h3 style={styles.sectionTitle}>INSTRUCTIONS</h3>
                <div style={styles.instructions}>
                  {recipe.instructions.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} style={styles.instructionLine} dangerouslySetInnerHTML={{
                        __html: line
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    }} />
                    ))}
                </div>
              </>
            )}
          </div>

          {/* Right column */}
          <div style={styles.sidebar}>
            {/* Ingredients + servings scaler */}
            <div style={styles.sidebarCard}>
              <div style={styles.ingredientsHeader}>
                <span style={styles.sidebarTitle}>INGREDIENTS</span>
                <div style={styles.scaler}>
                  <button style={styles.scalerBtn} onClick={() => setServings(Math.max(1, servings - 1))}>−</button>
                  <span style={styles.scalerNum}>{servings}</span>
                  <button style={styles.scalerBtn} onClick={() => setServings(servings + 1)}>+</button>
                </div>
              </div>
              {recipe.ingredients?.map((ing, i) => (
                <div key={i} style={styles.ingredient}>
                  <span style={styles.ingName}>{ing.name}</span>
                  <span style={styles.ingAmount}>
                    {ing.amount ? scaleAmount(ing.amount) : ''} {ing.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Nutrition */}
            {recipe.nutrition && (
              <div style={styles.sidebarCard}>
                <span style={styles.sidebarTitle}>NUTRITION PER 100G</span>
                {[
                  ['Calories', recipe.nutrition.calories, 'kcal'],
                  ['Protein', recipe.nutrition.protein, 'g'],
                  ['Carbs', recipe.nutrition.carbs, 'g'],
                  ['Fat', recipe.nutrition.fat, 'g'],
                  ['Fiber', recipe.nutrition.fiber, 'g'],
                ].map(([label, val, unit]) => val != null && (
                  <div key={label} style={styles.ingredient}>
                    <span style={styles.ingName}>{label}</span>
                    <span style={styles.ingAmount}>{val} {unit}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div style={styles.sidebarCard}>
              <div style={styles.notesHeader}>
                <span style={styles.sidebarTitle}>NOTES ({notes.length})</span>
              </div>
              <textarea
                style={styles.noteInput}
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <button style={styles.noteBtn} onClick={handleAddNote}>+ Add note</button>
              {notes.length === 0 && <p style={styles.noNotes}>No notes yet</p>}
              {notes.map(n => (
                <div key={n.id} style={styles.note}>
                  <p style={styles.noteContent}>{n.content}</p>
                  <p style={styles.noteMeta}>{n.author_name} · {new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Inter', sans-serif" },
  loading: { padding: 48, textAlign: 'center', color: '#888' },
  content: { maxWidth: 1200, margin: '0 auto', padding: '24px 32px' },
  back: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, marginBottom: 24, padding: 0, fontFamily: 'inherit' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 },
  main: {},
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerActions: { display: 'flex', gap: 8 },
  iconBtn: { background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 },
  titleJa: { fontSize: 32, fontWeight: 500, margin: '0 0 4px 0', color: '#1a1a1a' },
  titleEn: { fontSize: 16, fontWeight: 400, color: '#888', margin: 0 },
  meta: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' },
  tag: { background: '#f0f0ee', borderRadius: 999, padding: '4px 12px', fontSize: 12, color: '#555' },
  metaText: { fontSize: 13, color: '#888' },
  photo: { width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12, marginBottom: 24 },
  description: { fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, color: '#aaa', fontWeight: 600, marginBottom: 16 },
  instructions: {},
  instructionLine: { fontSize: 15, color: '#333', lineHeight: 1.8, margin: '0 0 8px 0' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
  sidebarCard: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 20 },
  ingredientsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sidebarTitle: { fontSize: 11, letterSpacing: 2, color: '#aaa', fontWeight: 600 },
  scaler: { display: 'flex', alignItems: 'center', gap: 12 },
  scalerBtn: { background: '#f5f5f3', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scalerNum: { fontSize: 16, fontWeight: 500, minWidth: 24, textAlign: 'center' },
  ingredient: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f3' },
  ingName: { fontSize: 14, color: '#333' },
  ingAmount: { fontSize: 14, color: '#888', textAlign: 'right' },
  notesHeader: { marginBottom: 12 },
  noteInput: { width: '100%', border: '1px solid #e5e5e5', borderRadius: 8, padding: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
  noteBtn: { marginTop: 8, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  noNotes: { color: '#aaa', fontSize: 13, textAlign: 'center', margin: '16px 0' },
  note: { borderTop: '1px solid #f5f5f3', paddingTop: 12, marginTop: 12 },
  noteContent: { fontSize: 14, color: '#333', margin: '0 0 4px 0', lineHeight: 1.6 },
  noteMeta: { fontSize: 11, color: '#aaa', margin: 0 },
}