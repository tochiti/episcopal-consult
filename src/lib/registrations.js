/* ---------------------------------------------------------------------------
   Episcopal Consult DNDN — registration helpers.
   Field model on each delegate document:
     - Identity:        title, titleOther, firstName, lastName, position
     - Geography:       province, diocese, body, dioceseOther
     - Contact:         whatsappNumber, emailAddress, emailAddressNormalized
     - Travel:          dateOfArrival, modeOfTravel, requireInternalTransport,
                        comingWithDriverEscort, driverName, driverPhoneNumber,
                        escortName, escortPhoneNumber
     - Accreditation:   passportPhoto (data URL), passportMime, passportSizeBytes
     - Operations:      accommodationId, roomNumber, checkInDate, checkOutDate,
                        transportId, pickupConfirmed
     - Protocol:        vipLevel, dietaryRequirements, specialNeeds, protocolNotes
     - Meta:            status, batchId, createdAt

   The "body" field is used when province is "Other (specify)" and the
   delegate picks one of the 9 standalone bodies (theological colleges,
   missionary dioceses, etc.). If the body is also "Other (specify)" we
   fall through to "dioceseOther" (free text).
   --------------------------------------------------------------------------- */

export const DNDN_FACTS = {
  name: 'Diocese of Niger Delta North',
  province: 'Niger Delta Province, Church of Nigeria (Global Anglican Communion)',
  hostBishop: 'The Rt Revd Wisdom Budu Ihunwo',
  cathedral: "St Paul's Cathedral, Diobu, Port Harcourt",
  established: '1996',
  city: 'Port Harcourt',
  state: 'Rivers State',
  country: 'Nigeria',
  copyright: 'DNDN 2026',
};

/* Programme dates — the Episcopal Consultation runs Monday 13 July
   through Friday 17 July 2026, hosted by the Diocese of Niger Delta
   North. Surfaced in the homepage hero, the registration form hero,
   and the public footer. */
export const PROGRAMME_DATES = {
  start: '2026-07-13',
  end: '2026-07-17',
  display: 'Monday, 13th to Friday, 17th July 2026',
  displayUpper: 'MONDAY, 13TH TO FRIDAY, 17TH JULY 2026',
  short: '13–17 July 2026',
  iso: '2026-07-13/2026-07-17',
};

export const normalizeStatus = (status) => status || 'Pending';

export const formatDate = (value) => {
  if (!value) return '—';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getStatusMeta = (status) => {
  switch (normalizeStatus(status)) {
    case 'Approved':
      return { label: 'Approved' };
    case 'Declined':
      return { label: 'Declined' };
    default:
      return { label: 'Pending' };
  }
};

export const composeFullName = (r) => {
  if (!r) return '';
  /* Honorific — "Other (specify)" cases use the typed-in text. */
  const titleValue =
    r.title === 'Other (specify)' ? r.titleOther || '' : r.title || '';
  const title = titleValue ? `${titleValue} ` : '';
  const name = [r.firstName, r.lastName].filter(Boolean).join(' ');
  return `${title}${name}`.trim();
};

export const composeDiocese = (r) => {
  if (!r) return '';
  /* When the delegate picked "Other (specify)" for province, they either
     picked one of the 9 standalone bodies (→ body) or typed free text
     (→ dioceseOther). Order: body, dioceseOther, diocese. */
  if (r.province === 'Other (specify)') {
    if (r.body && r.body !== 'Other (specify)') return r.body;
    if (r.dioceseOther) return r.dioceseOther;
    return '';
  }
  return r.diocese || '';
};

/* ---------------------------------------------------------------------------
   CSV export — column order matches what an event secretariat would import
   into Excel or a delegate management system.
   --------------------------------------------------------------------------- */
export const REGISTRATION_EXPORT_COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Surname' },
  { key: 'position', label: 'Position / Role' },
  { key: 'province', label: 'Province' },
  { key: 'diocese', label: 'Diocese', format: (row) => composeDiocese(row) },
  { key: 'whatsappNumber', label: 'WhatsApp Number' },
  { key: 'emailAddress', label: 'Email Address' },
  { key: 'dateOfArrival', label: 'Date of Arrival', format: (row) => formatDate(row.dateOfArrival) },
  { key: 'modeOfTravel', label: 'Mode of Travel' },
  { key: 'requireInternalTransport', label: 'Internal Transport' },
  { key: 'comingWithDriverEscort', label: 'Driver / Escort' },
  { key: 'driverName', label: 'Driver Name' },
  { key: 'driverPhoneNumber', label: 'Driver Phone' },
  { key: 'escortName', label: 'Escort Name' },
  { key: 'escortPhoneNumber', label: 'Escort Phone' },
  { key: 'passportPhoto', label: 'Passport Photo', format: (row) => (row.passportPhoto ? 'Attached' : 'Not attached') },
  { key: 'vipLevel', label: 'Protocol Level' },
  { key: 'dietaryRequirements', label: 'Dietary' },
  { key: 'specialNeeds', label: 'Special Needs' },
  { key: 'accommodationId', label: 'Hotel' },
  { key: 'roomNumber', label: 'Room' },
  { key: 'checkInDate', label: 'Check-in', format: (row) => formatDate(row.checkInDate) },
  { key: 'checkOutDate', label: 'Check-out', format: (row) => formatDate(row.checkOutDate) },
  { key: 'transportId', label: 'Pickup assigned' },
  { key: 'pickupConfirmed', label: 'Pickup confirmed' },
  { key: 'status', label: 'Status', format: (row) => normalizeStatus(row.status) },
  { key: 'createdAt', label: 'Registration Date', format: (row) => formatDateTime(row.createdAt) },
];

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export const downloadRegistrationsCsv = (rows, filename = 'episcopal_consult_registrations.csv') => {
  const headers = REGISTRATION_EXPORT_COLUMNS.map((column) => csvEscape(column.label)).join(',');
  const contentRows = rows.map((row) =>
    REGISTRATION_EXPORT_COLUMNS.map((column) => {
      const value = column.format ? column.format(row) : row[column.key];
      return csvEscape(value);
    }).join(',')
  );
  const csvContent = [headers, ...contentRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* ---------------------------------------------------------------------------
   Analytics — supports the admin planning dashboard.
   --------------------------------------------------------------------------- */
export const summarizeRegistrations = (registrations) => {
  const total = registrations.length;
  const approved = registrations.filter((r) => normalizeStatus(r.status) === 'Approved').length;
  const pending = registrations.filter((r) => normalizeStatus(r.status) === 'Pending').length;
  const declined = registrations.filter((r) => normalizeStatus(r.status) === 'Declined').length;
  const needTransport = registrations.filter((r) => r.requireInternalTransport === 'Yes').length;
  const withEscort = registrations.filter((r) => r.comingWithDriverEscort === 'Yes').length;
  const withPassport = registrations.filter((r) => Boolean(r.passportPhoto)).length;
  const withoutPassport = total - withPassport;
  const withAccommodation = registrations.filter((r) => r.accommodationId).length;
  const withTransport = registrations.filter((r) => r.transportId).length;
  const archbishopCount = registrations.filter((r) => (r.vipLevel || '') === 'archbishop').length;
  const dignitaryCount = registrations.filter((r) => (r.vipLevel || '') === 'dignitary').length;
  const specialCount = registrations.filter((r) => (r.vipLevel || '') === 'special').length;

  const statusChart = [
    { name: 'Approved', count: approved, fill: '#5fb98a' },
    { name: 'Pending', count: pending, fill: '#e0b25a' },
    { name: 'Declined', count: declined, fill: '#e57787' },
  ];

  const provinceCounts = registrations.reduce((acc, r) => {
    const k = r.province || 'Unspecified';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const provinceChart = Object.entries(provinceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const dioceseCounts = registrations.reduce((acc, r) => {
    const k = composeDiocese(r) || 'Unspecified';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const dioceses = Object.entries(dioceseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const travelModeCounts = registrations.reduce(
    (acc, r) => {
      const k = r.modeOfTravel || 'Unspecified';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    { Air: 0, Road: 0, Rail: 0, Unspecified: 0 }
  );
  const travelModes = Object.entries(travelModeCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const arrivalMap = registrations.reduce((acc, r) => {
    if (!r.dateOfArrival) return acc;
    const sortKey = new Date(r.dateOfArrival).getTime();
    if (Number.isNaN(sortKey)) return acc;
    const key = r.dateOfArrival;
    if (!acc[key]) {
      acc[key] = { date: formatDate(r.dateOfArrival), raw: key, count: 0, sortKey };
    }
    acc[key].count += 1;
    return acc;
  }, {});
  const arrivalTimeline = Object.values(arrivalMap)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-14);

  const provinceStatusMatrix = {};
  registrations.forEach((r) => {
    const p = r.province || 'Unspecified';
    if (!provinceStatusMatrix[p]) {
      provinceStatusMatrix[p] = { province: p, Approved: 0, Pending: 0, Declined: 0, total: 0 };
    }
    const s = normalizeStatus(r.status);
    if (provinceStatusMatrix[p][s] !== undefined) {
      provinceStatusMatrix[p][s] += 1;
    }
    provinceStatusMatrix[p].total += 1;
  });

  const transportByProvince = registrations.reduce((acc, r) => {
    const p = r.province || 'Unspecified';
    if (!acc[p]) acc[p] = { province: p, transport: 0, escort: 0, total: 0 };
    if (r.requireInternalTransport === 'Yes') acc[p].transport += 1;
    if (r.comingWithDriverEscort === 'Yes') acc[p].escort += 1;
    acc[p].total += 1;
    return acc;
  }, {});

  const arrivalSlots = arrivalTimeline.map((slot) => ({
    ...slot,
    approved: registrations.filter(
      (r) => r.dateOfArrival === slot.raw && normalizeStatus(r.status) === 'Approved'
    ).length,
    transport: registrations.filter(
      (r) => r.dateOfArrival === slot.raw && r.requireInternalTransport === 'Yes'
    ).length,
  }));

  return {
    totals: {
      total,
      approved,
      pending,
      declined,
      needTransport,
      withEscort,
      withPassport,
      withoutPassport,
      withAccommodation,
      withTransport,
    },
    vip: { archbishop: archbishopCount, dignitary: dignitaryCount, special: specialCount, regular: total - archbishopCount - dignitaryCount - specialCount },
    statusChart,
    provinceChart,
    provinceStatusMatrix: Object.values(provinceStatusMatrix).sort((a, b) => b.total - a.total),
    transportByProvince: Object.values(transportByProvince).sort((a, b) => b.total - a.total),
    dioceses,
    travelModes,
    arrivalTimeline,
    arrivalSlots,
  };
};

/* Filters — return a predicate that the admin list can use. */
export const buildRegistrationFilter = ({ query, province, status, travelMode, needsTransport, hasPassport, arrivalDate, vipLevel }) => {
  return (r) => {
    if (query) {
      const q = query.trim().toLowerCase();
      if (q) {
        const haystack = [
          r.firstName,
          r.lastName,
          r.title,
          r.position,
          composeDiocese(r),
          r.province,
          r.emailAddress,
          r.whatsappNumber,
          r.driverName,
          r.escortName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
    }
    if (province && r.province !== province) return false;
    if (status && normalizeStatus(r.status) !== status) return false;
    if (travelMode && r.modeOfTravel !== travelMode) return false;
    if (needsTransport === 'yes' && r.requireInternalTransport !== 'Yes') return false;
    if (needsTransport === 'no' && r.requireInternalTransport !== 'No') return false;
    if (hasPassport === 'yes' && !r.passportPhoto) return false;
    if (hasPassport === 'no' && r.passportPhoto) return false;
    if (arrivalDate && r.dateOfArrival !== arrivalDate) return false;
    if (vipLevel && (r.vipLevel || 'regular') !== vipLevel) return false;
    return true;
  };
};
