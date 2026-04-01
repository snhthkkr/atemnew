import { createThought } from './model/Thought.js'
import { createConnection } from './model/Connection.js'
import { initDB, saveThought, saveConnection, loadAll } from './store/db.js'
import { initRenderer } from './renderer/canvas2d.js'

const canvas = document.getElementById('canvas')
const { render } = initRenderer(canvas)
const space = { thoughts: new Map(), connections: new Map(), viewport: { x: 0, y: 0, zoom: 1 } }
let dragging = null, connecting = null, holdTimer = null, activeInput = null, pointerMoved = false, dragOffset = { x: 0, y: 0 }

function toWorld(cx, cy) { return { x: (cx - space.viewport.x) / space.viewport.zoom, y: (cy - space.viewport.y) / space.viewport.zoom } }
function thoughtAt(wx, wy) { for (const [id, t] of space.thoughts) { const dx = wx-t.position.x, dy = wy-t.position.y; if (Math.sqrt(dx*dx+dy*dy) < t.properties.size) return t } return null }
function getPoint(e) { if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY } }

function openInput(thought, isNew) {
  if (activeInput) activeInput.remove()
  const size = thought.properties.size * space.viewport.zoom
  const sx = thought.position.x * space.viewport.zoom + space.viewport.x
  const sy = thought.position.y * space.viewport.zoom + space.viewport.y
  const input = document.createElement('input')
  input.type = 'text'
  input.value = thought.properties.label || ''
  input.style.position = 'fixed'
  input.style.left = (sx - size) + 'px'
  input.style.top = (sy - 14) + 'px'
  input.style.width = (size * 2) + 'px'
  input.style.background = 'transparent'
  input.style.border = 'none'
  input.style.outline = 'none'
  input.style.color = '#ffffff'
  input.style.fontSize = '13px'
  input.style.textAlign = 'center'
  input.style.fontFamily = 'sans-serif'
  input.style.caretColor = '#ffffff'
  document.body.appendChild(input)
  input.focus()
  activeInput = input
  function commit() {
    const val = input.value.trim()
    if (isNew && !val) { space.thoughts.delete(thought.id) }
    else { thought.properties.label = val; thought.updatedAt = Date.now(); saveThought(thought) }
    input.remove(); activeInput = null; loop()
  }
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { if (isNew) space.thoughts.delete(thought.id); input.remove(); activeInput = null; loop() } })
  input.addEventListener('blur', commit)
}

canvas.addEventListener('pointerdown', (e) => {
  if (activeInput) return
  pointerMoved = false
  const pt = getPoint(e), w = toWorld(pt.x, pt.y), hit = thoughtAt(w.x, w.y)
  if (hit) {
    holdTimer = setTimeout(() => { holdTimer = null; connecting = hit; loop() }, 300)
    dragging = hit; dragOffset = { x: w.x - hit.position.x, y: w.y - hit.position.y }; return
  }
  const t = createThought(w.x, w.y)
  space.thoughts.set(t.id, t); loop(); openInput(t, true)
})

canvas.addEventListener('pointermove', (e) => {
  if (!dragging || connecting) return
  pointerMoved = true
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
  const pt = getPoint(e), w = toWorld(pt.x, pt.y)
  dragging.position.x = w.x - dragOffset.x; dragging.position.y = w.y - dragOffset.y; loop()
})

canvas.addEventListener('pointerup', (e) => {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
  const pt = getPoint(e), w = toWorld(pt.x, pt.y)
  if (connecting) {
    const hit = thoughtAt(w.x, w.y)
    if (hit && hit.id !== connecting.id) { const conn = createConnection(connecting.id, hit.id); space.connections.set(conn.id, conn); saveConnection(conn) }
    connecting = null; dragging = null; loop(); return
  }
  if (dragging && !pointerMoved) { const hit = dragging; dragging = null; openInput(hit, false); return }
  if (dragging) { saveThought(dragging); dragging = null }
})

function loop() { render(space) }

async function init() {
  await initDB()
  const { thoughts, connections } = await loadAll()
  thoughts.forEach(t => space.thoughts.set(t.id, t))
  connections.forEach(c => space.connections.set(c.id, c))
  loop()
}

init()