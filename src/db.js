import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'episcopal_consultation_registrations';

export const saveRegistration = async (data) => {
  try {
    const payload = {
      ...data,
      title: data.title.trim(),
      fullName: data.fullName.trim(),
      position: data.position.trim(),
      diocese: data.diocese.trim(),
      province: data.province.trim(),
      whatsappNumber: data.whatsappNumber.trim(),
      emailAddress: data.emailAddress.trim(),
      emailAddressNormalized: data.emailAddress.trim().toLowerCase(),
      driverName: data.comingWithDriverEscort === 'Yes' ? data.driverName.trim() : '',
      escortName: data.comingWithDriverEscort === 'Yes' ? data.escortName.trim() : '',
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...payload,
    });
    return { id: docRef.id, ...payload };
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

export const getRegistrationByEmail = async (email) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const exactQuery = query(
      collection(db, COLLECTION_NAME),
      where('emailAddressNormalized', '==', normalizedEmail),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const exactSnapshot = await getDocs(exactQuery);
    if (!exactSnapshot.empty) {
      const match = exactSnapshot.docs[0];
      return { id: match.id, ...match.data() };
    }

    const fallbackQuery = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(fallbackQuery);
    const registrations = querySnapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    return registrations.find((registration) => registration.emailAddress?.toLowerCase() === normalizedEmail);
  } catch (error) {
    console.error("Error finding registration: ", error);
    throw error;
  }
};

export const deleteRegistration = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting registration: ", error);
    throw error;
  }
};
