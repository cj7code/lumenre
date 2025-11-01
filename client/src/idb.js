// Light IndexedDB helper
import { openDB } from 'idb';

export async function getDB() {
  return openDB('lumenre-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('modules')) db.createObjectStore('modules', { keyPath: '_id' });
      if (!db.objectStoreNames.contains('pendingAttempts')) db.createObjectStore('pendingAttempts', { keyPath: '_id', autoIncrement: true });
    }
  });
}
