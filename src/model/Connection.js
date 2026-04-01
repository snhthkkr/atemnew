export function createConnection(f, t) {
  return {
    id: crypto.randomUUID(),
    from: f,
    to: t,
    properties: { style: 'line', color: '#444444', direction: 'none', weight: 1 },
    createdAt: Date.now()
  }
}