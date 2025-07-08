import Jsoning from 'jsoning';

export const db = new Jsoning('./db.json');

// Ensure structure exists on first load
let users = await db.get('users');
if (!Array.isArray(users)) await db.set('users', []);

let shop = await db.get('shop');
if (!Array.isArray(shop)) await db.set('shop', []);