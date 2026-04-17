import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBnMfTqInBrDqPnq06CbMkIyGomOwboFto",
  authDomain: "indicabs-prod.firebaseapp.com",
  projectId: "indicabs-prod",
  storageBucket: "indicabs-prod.firebasestorage.app",
  messagingSenderId: "404641872366",
  appId: "1:404641872366:web:96a41afc11a7794e27f6ff",
  measurementId: "G-T05N1HJPNB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
