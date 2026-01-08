// scripts/migrate-sites.js
// Run this script once to add userId to existing sites in Firestore

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateSites() {
  try {
    console.log('Starting migration...');
    
    const sitesRef = db.collection('sites');
    const snapshot = await sitesRef.get();
    
    if (snapshot.empty) {
      console.log('No sites found');
      return;
    }

    let count = 0;
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Only update if userId doesn't exist
      if (!data.userId && !data.ownerId) {
        console.log(`Updating site: ${doc.id} (${data.name || data.businessName})`);
        
        // You need to determine the userId for each site
        // Option 1: Set a default userId (replace with actual user ID)
        // Option 2: Use auth().getUserByEmail() if you have owner's email
        
        batch.update(doc.ref, {
          userId: 'DEFAULT_USER_ID', // Replace with actual logic
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Migration complete! Updated ${count} sites.`);
    } else {
      console.log('All sites already have userId field');
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit();
  }
}

migrateSites();

// To run this script:
// 1. Install firebase-admin: npm install firebase-admin
// 2. Download service account key from Firebase Console
// 3. Run: node scripts/migrate-sites.js