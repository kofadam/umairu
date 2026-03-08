export default function RecipeCard({ recipe, onClick }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div style={styles.card} onClick={onClick}>
      {/* Photo or placeholder */}
      {recipe.photo_url ? (
        <img src={recipe.photo_url} alt={recipe.title} style={styles.photo} />
      ) : (
        <div style={styles.photoPlaceholder}>🍽</div>
      )}

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div style={styles.tags}>
          {recipe.tags.map(t => (
            <span key={t.id} style={styles.tag}>{t.name}</span>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {recipe.title_ja && (
          <p style={styles.titleJa}>{recipe.title_ja}</p>
        )}
        <h3 style={styles.title}>{recipe.title}</h3>
        {recipe.description && (
          <p style={styles.description}>{recipe.description}</p>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          {totalTime > 0 && (
            <span style={styles.meta}>⏱ {totalTime} min</span>
          )}
          {recipe.servings && (
            <span style={styles.meta}>👤 {recipe.servings} servings</span>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #ebebeb',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 220,
    objectFit: 'cover',
    display: 'block',
  },
  photoPlaceholder: {
    width: '100%',
    height: 220,
    background: '#f5f5f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
  },
  tags: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  tag: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e5e5e5',
    borderRadius: 999,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 500,
    color: '#555',
  },
  content: {
    padding: '16px 20px 20px',
  },
  titleJa: {
    fontSize: 18,
    fontWeight: 500,
    margin: '0 0 2px 0',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: 400,
    margin: '0 0 8px 0',
    color: '#888',
  },
  description: {
    fontSize: 13,
    color: '#666',
    margin: '0 0 16px 0',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    gap: 16,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
}