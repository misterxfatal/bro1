const DB_NAME = 'quizDB_v2';
const STORE_NAME = 'sqliteDB';
const DB_KEY = 'quiz_data';

export async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const storeRequest = store.put(data, DB_KEY);

      storeRequest.onerror = () => reject(storeRequest.error);
      storeRequest.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    };
  });
}

export async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const storeRequest = store.get(DB_KEY);

      storeRequest.onerror = () => reject(storeRequest.error);
      storeRequest.onsuccess = () => resolve(storeRequest.result || null);

      transaction.oncomplete = () => db.close();
    };
  });
}