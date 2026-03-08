import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMealPlan, createMealPlan, deleteMealPlan, getRecipes } from '../api'
import Navbar from '../components/Navbar'

export default function MealPlanPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [recipes, setRecipes] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    Promise.all([
      getMealPlan(currentMonth),
      getRecipes()
    ]).then(([planRes, recipeRes]) => {
      setPlans(planRes.data)
      setRecipes(recipeRes.data)
      setLoading(false)
    })
  }, [])

  const handleAdd = async () => {
    if (!selectedDate || !selectedRecipe) return
    try {
      const res = await createMealPlan({
        date: selectedDate,
        recipe: selectedRecipe,
        notes,
      })
      setPlans(p => [...p, res.data].sort((a, b) => a.date.localeCompare(b.date)))
      setSelectedDate('')
      setSelectedRecipe('')
      setNotes('')
    } catch (e) {
      alert('Could not add meal plan — maybe already planned for that day?')
    }
  }

  const handleDelete = async (id) => {
    await deleteMealPlan(id)
    setPlans(p => p.filter(x => x.id !== id))
  }

  // Build a week view starting from today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const planByDate = plans.reduce((acc, p) => {
    acc[p.date] = p
    return acc
  }, {})

  const dayLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.page}>
      <Navbar search="" onSearch={() => {}} onLogout={() => {}} onNewRecipe={() => navigate('/recipes/new')} />

      <div style={styles.content}>
        <button style={styles.back} onClick={() => navigate('/')}>← All Recipes</button>
        <h1 style={styles.heading}>Meal Plan</h1>
        <p style={styles.subtitle}>What's for dinner this week?</p>

        {/* Week view */}
        <div style={styles.week}>
          {days.map(date => {
            const plan = planByDate[date]
            const isToday = date === today.toISOString().split('T')[0]
            return (
              <div key={date} style={{ ...styles.dayCard, ...(isToday ? styles.todayCard : {}) }}>
                <div style={styles.dayHeader}>
                  <span style={styles.dayLabel}>{dayLabel(date)}</span>
                  {isToday && <span style={styles.todayBadge}>Today</span>}
                </div>
                {plan ? (
                  <div style={styles.plannedMeal}>
                    <span
                      style={styles.mealTitle}
                      onClick={() => navigate(`/recipes/${plan.recipe}`)}
                    >
                      {plan.recipe_detail?.title_ja || plan.recipe_detail?.title}
                    </span>
                    {plan.recipe_detail?.title_ja && (
                      <span style={styles.mealTitleEn}>{plan.recipe_detail.title}</span>
                    )}
                    {plan.notes && <p style={styles.planNotes}>{plan.notes}</p>}
                    <button style={styles.removeBtn} onClick={() => handleDelete(plan.id)}>✕</button>
                  </div>
                ) : (
                  <button
                    style={styles.emptyDay}
                    onClick={() => setSelectedDate(date)}
                  >
                    + Plan dinner
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Add form */}
        <div style={styles.addCard}>
          <h3 style={styles.addTitle}>Plan a dinner</h3>
          <div style={styles.addRow}>
            <input
              style={styles.input}
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <select
              style={styles.select}
              value={selectedRecipe}
              onChange={e => setSelectedRecipe(e.target.value)}
            >
              <option value="">Select a recipe...</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title_ja ? `${r.title_ja} — ${r.title}` : r.title}
                </option>
              ))}
            </select>
            <input
              style={styles.input}
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <button style={styles.addBtn} onClick={handleAdd}>Add</button>
          </div>
        </div>

        {/* Full plan list */}
        {plans.length > 0 && (
          <div style={styles.allPlans}>
            <h3 style={styles.addTitle}>This month</h3>
            {plans.map(p => (
              <div key={p.id} style={styles.planRow}>
                <span style={styles.planDate}>{dayLabel(p.date)}</span>
                <span
                  style={styles.planRecipe}
                  onClick={() => navigate(`/recipes/${p.recipe}`)}
                >
                  {p.recipe_detail?.title_ja || p.recipe_detail?.title}
                </span>
                <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Inter', sans-serif" },
  loading: { padding: 48, textAlign: 'center', color: '#888' },
  content: { maxWidth: 900, margin: '0 auto', padding: '24px 32px' },
  back: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, marginBottom: 24, padding: 0, fontFamily: 'inherit' },
  heading: { fontSize: 32, fontWeight: 500, margin: '0 0 4px 0' },
  subtitle: { color: '#888', fontSize: 14, margin: '0 0 32px 0' },
  week: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 32 },
  dayCard: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, padding: 12, minHeight: 100 },
  todayCard: { border: '1px solid #1a1a1a' },
  dayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayLabel: { fontSize: 11, color: '#888', fontWeight: 500 },
  todayBadge: { fontSize: 10, background: '#1a1a1a', color: '#fff', borderRadius: 4, padding: '2px 6px' },
  plannedMeal: { position: 'relative' },
  mealTitle: { fontSize: 13, fontWeight: 500, color: '#1a1a1a', cursor: 'pointer', display: 'block', marginBottom: 2 },
  mealTitleEn: { fontSize: 11, color: '#aaa', display: 'block' },
  planNotes: { fontSize: 11, color: '#888', margin: '4px 0 0 0' },
  removeBtn: { position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 12, padding: 0 },
  emptyDay: { background: 'none', border: '1px dashed #ddd', borderRadius: 6, width: '100%', padding: '8px 0', fontSize: 11, color: '#bbb', cursor: 'pointer', fontFamily: 'inherit' },
  addCard: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 24, marginBottom: 24 },
  addTitle: { fontSize: 14, fontWeight: 600, margin: '0 0 16px 0' },
  addRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', outline: 'none', flex: 1, minWidth: 140 },
  select: { padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', outline: 'none', flex: 2, minWidth: 200 },
  addBtn: { padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
  allPlans: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 24 },
  planRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid #f5f5f3' },
  planDate: { fontSize: 13, color: '#888', width: 180, flexShrink: 0 },
  planRecipe: { fontSize: 14, color: '#1a1a1a', flex: 1, cursor: 'pointer' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 14, padding: 0 },
}