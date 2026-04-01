export function createThought(x, y) {
  return {
    id: crypto.randomUUID(),
    position: { x, y },
    properties: { label: '', shape: 'circle', color: '#ffffff', size: 36 },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}