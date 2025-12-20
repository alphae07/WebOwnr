const admin = require('firebase-admin');
const serviceJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceJson) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
  process.exit(1);
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceJson);
} catch (e) {
  console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON. Must be valid JSON.', e);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addStorageFields() {
  try {
    const sitesSnapshot = await db.collection('sites').get();
    
    const batch = db.batch();
    
    sitesSnapshot.docs.forEach(doc => {
      const siteRef = db.collection('sites').doc(doc.id);
      batch.update(siteRef, {
        storageUsed: 0,
        storageLimit: 100 * 1024 * 1024 // 100MB in bytes
      });
    });
    
    await batch.commit();
    console.log(`Updated ${sitesSnapshot.docs.length} sites with storage fields`);
  } catch (error) {
    console.error('Error:', error);
  }
}

addStorageFields();
