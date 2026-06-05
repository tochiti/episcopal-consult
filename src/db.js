import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'episcopal_consultation_registrations';

export const saveRegistration = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'Pending', // New field for the admin dashboard
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data, status: 'Pending' };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getRegistrations = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });
    return registrations;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

export const updateRegistrationStatus = async (id, status) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};
