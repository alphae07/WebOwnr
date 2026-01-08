const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 


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
