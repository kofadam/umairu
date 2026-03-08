import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRecipe, updateRecipe, getRecipe, importFromUrl, importFromMarkdown, getTags } from '../api'
import Navbar from '../components/Navbar'

export default function AddRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tags, setTags] = useState([])
  const [importUrl, setImportUrl] = useState('')
  const [importMd, setImportMd] = useState('')
  const [importMode, setImportMode] = useState('url') // 'url' | 'md'
  const [importing, setImporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    title_ja: '',
    description: '',
    source_url: '',
    instructions: '',
    prep_time: '',
    cook_time: '',
    servings: 4,
    tag_ids: [],
    ingredients: [],
  })

  useEffect(() => {
    getTags().then(res => setTags(res.data))
    if (isEdit) {
      getRecipe(id).then(res => {
        const r = res.data
        setForm({
          title: r.title || '',
          title_ja: r.title_ja || '',
          description: r.description || '',
          source_url: r.source_url || '',
          instructions: r.instructions || '',
          prep_time: r.prep_time || '',
          cook_time: r.cook_time || '',
          servings: r.servings || 4,
          tag_ids: r.tags?.map(t => t.id) || [],
          ingredients: r.ingredients || [],
        })
      })
    }
  }, [id])

  const applyImport = (data) => {
    setForm(f => ({
      ...f,
      title: data.title || f.title,
      description: data.description || f.description,
      instructions: data.instructions || f.instructions,
      prep_time: data.prep_time || f.prep_time,
      cook_time: data.cook_time || f.cook_time,
      servings: data.servings || f.servings,
      source_url: data.source_url || f.source_url,
      ingredients: data.ingredients?.length ? data.ingredients : f.ingredients,
    }))
  }

  const handleImportUrl = async () => {
    if (!importUrl) return
    setImporting(true)
    setError('')
    try {
      const res = await importFromUrl(importUrl)
      applyImport(res.data)
    } catch {
      setError('Could not fetch recipe from URL')
    } finally {
      setImporting(false)
    }
  }

  const handleImportMd = async () => {
    if (!importMd) return
    setImporting(true)
    setError('')
    try {
      const res = await importFromMarkdown(importMd)
      applyImport(res.data)
    } catch {
      setError('Could not parse markdown')
    } finally {
      setImporting(false)
    }
  }

  const handleField = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleIngredient = (i, field, value) => {
    const updated = [...form.ingredients]
    updated[i] = { ...updated[i], [field]: value }
    setForm(f => ({ ...f, ingredients: updated }))
  }

  const addIngredient = () => {
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', amount: '', unit: '', notes: '' }] }))
  }

  const removeIngredient = (i) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))
  }

  const toggleTag = (tagId) => {
    setForm(f => ({
      ...f,
      tag_ids: f.tag_ids.includes(tagId)
        ? f.tag_ids.filter(t => t !== tagId)
        : [...f.tag_ids, tagId]
    }))
  }

  const handleSave = async () => {
    if (!form.title) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        prep_time: form.prep_time || null,
        cook_time: form.cook_time || null,
      }
      if (isEdit) {
        await updateRecipe(id, payload)
        navigate(`/recipes/${id}`)
      } else {
        const res = await createRecipe(payload)
        navigate(`/recipes/${res.data.id}`)
      }
    } catch (e) {
      setError('Failed to save recipe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar search="" onSearch={() => {}} onLogout={() => {}} onNewRecipe={() => {}} />

      <div style={styles.content}>
        <button style={styles.back} onClick={() => navigate('/')}>← All Recipes</button>
        <h1 style={styles.heading}>{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>

        {!isEdit && (
          <div style={styles.importCard}>
            {/* Import mode tabs */}
            <div style={styles.importTabs}>
              <button
                style={importMode === 'url' ? styles.tabActive : styles.tab}
                onClick={() => setImportMode('url')}
              >
                🔗 Import from URL
              </button>
              <button
                style={importMode === 'md' ? styles.tabActive : styles.tab}
                onClick={() => setImportMode('md')}
              >
                📋 Paste Markdown
              </button>
            </div>

            {importMode === 'url' ? (
              <div style={styles.importRow}>
                <input
                  style={styles.importInput}
                  placeholder="Paste a recipe URL..."
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                />
                <button style={styles.importBtn} onClick={handleImportUrl} disabled={importing}>
                  {importing ? 'Fetching...' : 'Import'}
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  style={styles.mdInput}
                  placeholder="Paste your ChatGPT recipe markdown here..."
                  value={importMd}
                  onChange={e => setImportMd(e.target.value)}
                  rows={8}
                />
                <button style={styles.importBtn} onClick={handleImportMd} disabled={importing}>
                  {importing ? 'Parsing...' : 'Parse'}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={styles.divider}><span style={styles.dividerText}>or enter manually</span></div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Form */}
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Recipe name</label>
            <input style={styles.input} placeholder="Chicken Teriyaki" value={form.title} onChange={e => handleField('title', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Japanese name (optional)</label>
            <input style={styles.input} placeholder="チキン照り焼き" value={form.title_ja} onChange={e => handleField('title_ja', e.target.value)} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} placeholder="A short description..." value={form.description} onChange={e => handleField('description', e.target.value)} rows={3} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Source URL</label>
          <input style={styles.input} placeholder="https://..." value={form.source_url} onChange={e => handleField('source_url', e.target.value)} />
        </div>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Servings</label>
            <input style={styles.input} type="number" min={1} value={form.servings} onChange={e => handleField('servings', parseInt(e.target.value))} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Prep time (min)</label>
            <input style={styles.input} type="number" min={0} value={form.prep_time} onChange={e => handleField('prep_time', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Cook time (min)</label>
            <input style={styles.input} type="number" min={0} value={form.cook_time} onChange={e => handleField('cook_time', e.target.value)} />
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={styles.field}>
            <label style={styles.label}>Tags</label>
            <div style={styles.tagPicker}>
              {tags.map(t => (
                <button
                  key={t.id}
                  style={form.tag_ids.includes(t.id) ? styles.tagActive : styles.tag}
                  onClick={() => toggleTag(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div style={styles.field}>
          <label style={styles.label}>Ingredients</label>
          {form.ingredients.map((ing, i) => (
            <div key={i} style={styles.ingredientRow}>
              <input style={{...styles.input, flex: 1}} placeholder="Name" value={ing.name} onChange={e => handleIngredient(i, 'name', e.target.value)} />
              <input style={{...styles.input, width: 80}} placeholder="Amount" value={ing.amount} onChange={e => handleIngredient(i, 'amount', e.target.value)} />
              <input style={{...styles.input, width: 80}} placeholder="Unit" value={ing.unit} onChange={e => handleIngredient(i, 'unit', e.target.value)} />
              <button style={styles.removeBtn} onClick={() => removeIngredient(i)}>✕</button>
            </div>
          ))}
          <button style={styles.addBtn} onClick={addIngredient}>+ Add ingredient</button>
        </div>

        {/* Instructions */}
        <div style={styles.field}>
          <label style={styles.label}>Instructions</label>
          <textarea style={styles.textarea} placeholder="Step by step instructions..." value={form.instructions} onChange={e => handleField('instructions', e.target.value)} rows={10} />
        </div>

        {/* Save */}
        <div style={styles.saveRow}>
          <button style={styles.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Inter', sans-serif" },
  content: { maxWidth: 800, margin: '0 auto', padding: '24px 32px' },
  back: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, marginBottom: 24, padding: 0, fontFamily: 'inherit' },
  heading: { fontSize: 32, fontWeight: 500, margin: '0 0 32px 0' },
  importCard: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 24, marginBottom: 8 },
  importTabs: { display: 'flex', gap: 8, marginBottom: 16 },
  tab: { padding: '7px 16px', borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#555' },
  tabActive: { padding: '7px 16px', borderRadius: 8, border: '1px solid #1a1a1a', background: '#1a1a1a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#fff' },
  importRow: { display: 'flex', gap: 8 },
  importInput: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', outline: 'none' },
  importBtn: { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  mdInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: 8 },
  divider: { textAlign: 'center', position: 'relative', margin: '24px 0', borderTop: '1px solid #e5e5e5' },
  dividerText: { background: '#fafaf8', padding: '0 16px', color: '#aaa', fontSize: 13, position: 'relative', top: -10 },
  error: { color: '#e53e3e', fontSize: 13, marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical' },
  tagPicker: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tag: { padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e5e5', background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#555' },
  tagActive: { padding: '6px 14px', borderRadius: 999, border: '1px solid #1a1a1a', background: '#1a1a1a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#fff' },
  ingredientRow: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16, padding: '0 4px' },
  addBtn: { background: 'none', border: '1px dashed #ccc', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: '#888', fontFamily: 'inherit', width: '100%', marginTop: 4 },
  saveRow: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32, paddingTop: 24, borderTop: '1px solid #ebebeb' },
  cancelBtn: { padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn: { padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
}