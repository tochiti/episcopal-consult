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
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'episcopal_consultation_registrations';

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

const buildPayload = (data) => ({
  title: trim(data.title),
  firstName: trim(data.firstName),
  lastName: trim(data.lastName),
  position: trim(data.position),
  otherAffiliation: trim(data.otherAffiliation),
  province: trim(data.province),
  diocese: trim(data.diocese),
  whatsappNumber: trim(data.whatsappNumber),
  emailAddress: trim(data.emailAddress),
  emailAddressNormalized: trim(data.emailAddress || '').toLowerCase(),
  dateOfArrival: trim(data.dateOfArrival),
  modeOfTravel: trim(data.modeOfTravel),
  requireInternalTransport: data.requireInternalTransport || 'No',
  comingWithDriverEscort: data.comingWithDriverEscort || 'No',
  driverName: data.comingWithDriverEscort === 'Yes' ? trim(data.driverName) : '',
  driverPhoneNumber: data.comingWithDriverEscort === 'Yes' ? trim(data.driverPhoneNumber) : '',
  escortName: data.comingWithDriverEscort === 'Yes' ? trim(data.escortName) : '',
  escortPhoneNumber: data.comingWithDriverEscort === 'Yes' ? trim(data.escortPhoneNumber) : '',
  passportPhoto: data.passportPhoto || null,
  passportMime: data.passportMime || null,
  passportSizeBytes: data.passportSizeBytes || 0,
  status: 'Pending',
  batchId: data.batchId || null,
  createdAt: serverTimestamp(),
});

export const saveRegistration = async (data) => {
  try {
    const payload = buildPayload(data);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

/* Multi-delegate batch save — single Firestore batch, shared batchId. */
export const saveRegistrationBatch = async (delegates) => {
  if (!Array.isArray(delegates) || delegates.length === 0) {
    throw new Error('No delegates to save');
  }
  const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const batch = writeBatch(db);
    const results = [];
    delegates.forEach((delegate) => {
      const payload = { ...buildPayload(delegate), batchId };
      const docRef = doc(collection(db, COLLECTION_NAME));
      batch.set(docRef, payload);
      results.push({ id: docRef.id, ...payload });
    });
    await batch.commit();
    return { batchId, registrations: results };
  } catch (e) {
    console.error('Error saving batch: ', e);
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
    console.error('Error getting documents: ', e);
    throw e;
  }
};

export const updateRegistrationStatus = async (id, status) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  } catch (e) {
    console.error('Error updating document: ', e);
    throw e;
  }
};

export const getRegistrationByEmail = async (email) => {
  try {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) return null;
    try {
      const exactQuery = query(
        collection(db, COLLECTION_NAME),
        where('emailAddressNormalized', '==', normalizedEmail),
        limit(20)
      );
      const exactSnapshot = await getDocs(exactQuery);
      if (!exactSnapshot.empty) {
        const matches = exactSnapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .sort((a, b) => {
            const left = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const right = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return right - left;
          });
        return matches[0];
      }
    } catch (indexedLookupError) {
      console.warn('Indexed email lookup failed, falling back to scan.', indexedLookupError);
    }

    const fallbackQuery = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(fallbackQuery);
    const registrations = querySnapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    return (
      registrations.find((r) => r.emailAddress?.toLowerCase() === normalizedEmail) || null
    );
  } catch (error) {
    console.error('Error finding registration: ', error);
    throw error;
  }
};

export const deleteRegistration = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};
