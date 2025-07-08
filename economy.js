import Jsoning from 'jsoning';

export const db = new Jsoning('./db.json');

// Ensure the structure exists on startup
let users = await db.get('users');
if (!Array.isArray(users)) await db.set('users', []);

let shop = await db.get('shop');
if (!Array.isArray(shop)) await db.set('shop', []);