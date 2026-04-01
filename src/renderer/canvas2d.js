export function initRenderer(canvas) {
  const ctx = canvas.getContext('2d')
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)
  function render(space) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const { thoughts, connections, viewport } = space
    ctx.save()
    ctx.translate(viewport.x, viewport.y)
    ctx.scale(viewport.zoom, viewport.zoom)
    connections.forEach(conn => {
      const from = thoughts.get(conn.from), to = thoughts.get(conn.to)
      if (!from || !to) return
      ctx.beginPath(); ctx.moveTo(from.position.x, from.position.y); ctx.lineTo(to.position.x, to.position.y)
      ctx.strokeStyle = conn.properties.color; ctx.lineWidth = 2; ctx.stroke()
    })
    thoughts.forEach(t => {
      const { x, y } = t.position, { size, color, label } = t.properties
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2)
      ctx.fillStyle = color+'18'; ctx.fill()
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
      if (label) { ctx.fillStyle = color; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y) }
    })
    ctx.restore()
  }
  return { render }
}