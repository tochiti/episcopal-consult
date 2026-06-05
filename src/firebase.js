import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "citiguide-8d9d9",
  appId: "1:88655565116:web:0de0fda67979946d98ce39",
  storageBucket: "citiguide-8d9d9.appspot.com",
  locationId: "us-central",
  apiKey: "AIzaSyBmtzKn-RJ0tERl4HZPE0RXgy39a_xgQjs",
  authDomain: "citiguide-8d9d9.firebaseapp.com",
  messagingSenderId: "88655565116",
  measurementId: "G-497JNJ8V5D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
