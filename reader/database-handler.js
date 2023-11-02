const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require(process.env.DATABASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a Firestore database reference
const db = admin.firestore();

// Function to compare a string with all the "license" values in the database
async function compare(license) {
  const collectionRef = db.collection('users');

  try {
    const snapshot = await collectionRef.get();
    console.log('scanning');
    snapshot.forEach(doc => {
        const documentData = doc.data();
        const documentLicense = documentData['License'];
        if (license.includes(documentLicense)) {
          console.log('Plate recognized: ' + documentLicense);
        }
    });
  } catch (error) {
    console.error('Error getting documents:', error);
  }
}


module.exports = compare;
