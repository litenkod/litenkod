import { openDB } from "idb";

const DB_NAME = "litenkod";
const DB_VERSION = 1;
const STORE_NAME = "lists";
const LIST_KEY = "list";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

/**
 * Saves a list of items to IndexedDB under the fixed key.
 * @param {unknown[]} list
 * @returns {Promise<void>}
 */
export async function saveList(list) {
  const db = await dbPromise;
  await db.put(STORE_NAME, list, LIST_KEY);
}

/**
 * Reads the cached list from IndexedDB.
 * @returns {Promise<unknown[] | null>}
 */
export async function getList() {
  const db = await dbPromise;
  const cached = await db.get(STORE_NAME, LIST_KEY);
  if (!cached) {
    return null;
  }
  return cached;
}

/**
 * Clears the cached list entry.
 * @returns {Promise<void>}
 */
export async function clearList() {
  const db = await dbPromise;
  await db.delete(STORE_NAME, LIST_KEY);
}
