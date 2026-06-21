import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
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

export const COLLECTION_NAME = 'episcopal_consultation_registrations';
export const ACCOMMODATIONS_COLLECTION = 'episcopal_consultation_accommodations';
export const TRANSPORTS_COLLECTION = 'episcopal_consultation_transports';
export const SETTINGS_COLLECTION = 'episcopal_consultation_settings';
export const SETTINGS_DOC_ID = 'app_config';

const DEFAULT_SETTINGS = { autoApproveEnabled: false, notificationEmails: [] };

/* App-wide settings live in a single document. Missing fields fall back
   to DEFAULT_SETTINGS so the rest of the app never has to null-check. */
export const getSettings = async () => {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
    return snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : { ...DEFAULT_SETTINGS };
  } catch (e) {
    console.error('Error getting settings: ', e);
    return { ...DEFAULT_SETTINGS };
  }
};

export const updateSettings = async (patch) => {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), patch, { merge: true });
  } catch (e) {
    console.error('Error updating settings: ', e);
    throw e;
  }
};

/* Defensive trim — Firebase rejects undefined/null field values, so
   any non-string input (including the absent fields on a fresh form
   submission) collapses to an empty string. */
const trim = (v) => (typeof v === 'string' ? v.trim() : '');

const buildPayload = (data) => {
  /* "Other (specify)" honorifics are resolved to the typed-in text so
     the saved document carries the real honorific, not the literal
     string "Other (specify)". */
  const resolvedTitle =
    data.title === 'Other (specify)' ? trim(data.titleOther) : trim(data.title);

  /* "Other (specify)" provinces cascade to: body (one of the 9
     standalone bodies) → dioceseOther (free text). The saved document
     carries all three fields; composeDiocese() handles the resolution
     on the read side. */
  const isOtherProvince = data.province === 'Other (specify)';
  const resolvedDiocese = isOtherProvince ? trim(data.body) : trim(data.diocese);
  const resolvedDioceseOther =
    isOtherProvince && data.body === 'Other (specify)' ? trim(data.dioceseOther) : '';

  return {
    title: resolvedTitle,
    titleOther: data.title === 'Other (specify)' ? trim(data.titleOther) : '',
    firstName: trim(data.firstName),
    lastName: trim(data.lastName),
    position: trim(data.position),
    province: trim(data.province),
    diocese: resolvedDiocese,
    body: isOtherProvince ? trim(data.body) : '',
    dioceseOther: resolvedDioceseOther,
    whatsappNumber: trim(data.whatsappNumber),
    emailAddress: trim(data.emailAddress),
    emailAddressNormalized: trim(data.emailAddress || '').toLowerCase(),
    chaplainName: trim(data.chaplainName),
    chaplainPhoneNumber: trim(data.chaplainPhoneNumber),
    dateOfArrival: trim(data.dateOfArrival),
    modeOfTravel: trim(data.modeOfTravel),
    requireInternalTransport: data.requireInternalTransport || 'No',
    comingWithDriverEscort: data.comingWithDriverEscort || 'No',
    driverName: data.comingWithDriverEscort === 'Yes' ? trim(data.driverName) : '',
    driverPhoneNumber:
      data.comingWithDriverEscort === 'Yes' ? trim(data.driverPhoneNumber) : '',
    escortName: data.comingWithDriverEscort === 'Yes' ? trim(data.escortName) : '',
    escortPhoneNumber:
      data.comingWithDriverEscort === 'Yes' ? trim(data.escortPhoneNumber) : '',
    passportPhoto: data.passportPhoto || null,
    passportMime: data.passportMime || null,
    passportSizeBytes: data.passportSizeBytes || 0,
    /* Operations */
    accommodationId: data.accommodationId || null,
    roomNumber: trim(data.roomNumber),
    checkInDate: trim(data.checkInDate),
    checkOutDate: trim(data.checkOutDate),
    transportId: data.transportId || null,
    pickupConfirmed: Boolean(data.pickupConfirmed),
    /* Protocol */
    vipLevel: data.vipLevel || 'regular',
    dietaryRequirements: trim(data.dietaryRequirements),
    specialNeeds: trim(data.specialNeeds),
    protocolNotes: trim(data.protocolNotes),
    status: 'Pending',
    batchId: data.batchId || null,
    createdAt: serverTimestamp(),
  };
};

export const saveRegistration = async (data) => {
  try {
    /* When the secretariat has enabled auto-approval, new submissions
       skip the Pending queue and land as Approved straight away. */
    const { autoApproveEnabled } = await getSettings();
    const payload = buildPayload(data);
    if (autoApproveEnabled) payload.status = 'Approved';
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

export const saveRegistrationBatch = async (delegates) => {
  if (!Array.isArray(delegates) || delegates.length === 0) {
    throw new Error('No delegates to save');
  }
  const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const { autoApproveEnabled } = await getSettings();
    const batch = writeBatch(db);
    const results = [];
    delegates.forEach((delegate) => {
      const payload = { ...buildPayload(delegate), batchId };
      if (autoApproveEnabled) payload.status = 'Approved';
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

/* Partial update — used by the operations pages (badges, accommodation, etc.) */
export const updateDelegate = async (id, patch) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );
    await updateDoc(docRef, cleanPatch);
  } catch (e) {
    console.error('Error updating delegate: ', e);
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

/* ---------------------------------------------------------------------------
   Accommodation master list
   --------------------------------------------------------------------------- */
export const getAccommodations = async () => {
  try {
    const q = query(collection(db, ACCOMMODATIONS_COLLECTION), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Error getting accommodations: ', e);
    throw e;
  }
};

export const saveAccommodation = async (data) => {
  const payload = {
    name: trim(data.name),
    address: trim(data.address),
    contactPerson: trim(data.contactPerson),
    contactPhone: trim(data.contactPhone),
    totalRooms: Number(data.totalRooms) || 0,
    notes: trim(data.notes),
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, ACCOMMODATIONS_COLLECTION), payload);
  return { id: ref.id, ...payload };
};

export const deleteAccommodation = async (id) => {
  await deleteDoc(doc(db, ACCOMMODATIONS_COLLECTION, id));
};

/* ---------------------------------------------------------------------------
   Transport master list (vehicles / drivers)
   --------------------------------------------------------------------------- */
export const getTransports = async () => {
  try {
    const q = query(collection(db, TRANSPORTS_COLLECTION), orderBy('vehicleDescription', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Error getting transports: ', e);
    throw e;
  }
};

export const saveTransport = async (data) => {
  const payload = {
    vehicleDescription: trim(data.vehicleDescription),
    vehiclePlate: trim(data.vehiclePlate),
    driverName: trim(data.driverName),
    driverPhone: trim(data.driverPhone),
    capacity: Number(data.capacity) || 1,
    pickupLocation: trim(data.pickupLocation),
    notes: trim(data.notes),
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, TRANSPORTS_COLLECTION), payload);
  return { id: ref.id, ...payload };
};

export const deleteTransport = async (id) => {
  await deleteDoc(doc(db, TRANSPORTS_COLLECTION, id));
};
