import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('./db.json')
export const db = new Low(adapter)

// ⚠️ You must call read() before accessing db.data
await db.read()

// ✅ Set default structure if db.json is empty
if (!db.data) {
  db.data = { users: [], shop: [] }
  await db.write()
}