const DB_NAME = 'atem'
const DB_VERSION = 1
let db
export function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const d = e.target.result
      if (!d.objectStoreNames.contains('thoughts')) d.createObjectStore('thoughts', { keyPath: 'id' })
      if (!d.objectStoreNames.contains('connections')) d.createObjectStore('connections', { keyPath: 'id' })
    }
    req.onsuccess = (e) => { db = e.target.result; resolve() }
    req.onerror = () => reject(req.error)
  })
}
export function saveThought(t) { return db.transaction('thoughts','readwrite').objectStore('thoughts').put(t) }
export function saveConnection(c) { return db.transaction('connections','readwrite').objectStore('connections').put(c) }
export function loadAll() {
  return new Promise((resolve) => {
    const thoughts = [], connections = []
    const tx = db.transaction(['thoughts','connections'],'readonly')
    tx.objectStore('thoughts').openCursor().onsuccess = (e) => { const c=e.target.result; if(c){thoughts.push(c.value);c.continue()} }
    tx.objectStore('connections').openCursor().onsuccess = (e) => { const c=e.target.result; if(c){connections.push(c.value);c.continue()} }
    tx.oncomplete = () => resolve({thoughts, connections})
  })
}