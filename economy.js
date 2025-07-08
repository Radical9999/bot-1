import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

// 👇 define default structure up front
const defaultData = { users: {}, shop: [] };

const file = join('./db', 'database.json');
const adapter = new JSONFile(file);

// 👇 pass defaultData to Low
export const db = new Low(adapter, defaultData);

await db.read();
// No need to manually check `db.data` anymore
await db.write();