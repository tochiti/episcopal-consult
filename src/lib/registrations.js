/* ---------------------------------------------------------------------------
   Episcopal Consult DNDN — registration helpers.
   Field model:
     firstName, lastName, title, position, otherAffiliation,
     province, diocese, whatsappNumber, emailAddress, emailAddressNormalized,
     dateOfArrival, modeOfTravel, requireInternalTransport, comingWithDriverEscort,
     driverName, driverPhoneNumber, escortName, escortPhoneNumber,
     passportPhoto (data URL), passportMime, passportSizeBytes,
     status, batchId, createdAt
   --------------------------------------------------------------------------- */

export const DNDN_FACTS = {
  name: 'Diocese of Niger Delta North',
  province: 'Niger Delta Province, Church of Nigeria (Anglican Communion)',
  hostBishop: 'The Rt Revd Wisdom Budu Ihunwo',
  cathedral: "St Paul's Cathedral, Diobu, Port Harcourt",
  established: '1996',
  city: 'Port Harcourt',
  state: 'Rivers State',
  country: 'Nigeria',
};

export const normalizeStatus = (status) => status || 'Pending';

export const formatDate = (value) => {
  if (!value) return 'Not provided';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return 'Not recorded';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
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
  const title = r.title ? `${r.title} ` : '';
  const name = [r.firstName, r.lastName].filter(Boolean).join(' ');
  return `${title}${name}`.trim();
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
  { key: 'otherAffiliation', label: 'Other Affiliation' },
  { key: 'province', label: 'Province' },
  { key: 'diocese', label: 'Diocese' },
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
  const archbishopCount = registrations.filter((r) => (r.title || '').includes('Most Rev')).length;
  const bishopCount = registrations.filter((r) => (r.title || '').includes('Rt. Rev')).length;
  const clergyCount = registrations.filter((r) => (r.title || '').startsWith('The Rev') || (r.title || '').startsWith('The Ven') || (r.title || '').startsWith('The Very Rev')).length;
  const layCount = registrations.filter((r) => ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.'].some((t) => (r.title || '').startsWith(t))).length;

  const statusChart = [
    { name: 'Approved', count: approved, fill: '#5fb98a' },
    { name: 'Pending', count: pending, fill: '#e0b25a' },
    { name: 'Declined', count: declined, fill: '#e57787' },
  ];

  /* Province distribution */
  const provinceCounts = registrations.reduce((acc, r) => {
    const k = r.province || 'Unspecified';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const provinceChart = Object.entries(provinceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  /* Diocese distribution (top N) */
  const dioceseCounts = registrations.reduce((acc, r) => {
    const k = r.diocese || 'Unspecified';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const dioceses = Object.entries(dioceseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  /* Travel modes */
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

  /* Arrival timeline */
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

  /* Status by province (matrix) */
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

  /* Transport demand by province */
  const transportByProvince = registrations.reduce((acc, r) => {
    const p = r.province || 'Unspecified';
    if (!acc[p]) acc[p] = { province: p, transport: 0, escort: 0, total: 0 };
    if (r.requireInternalTransport === 'Yes') acc[p].transport += 1;
    if (r.comingWithDriverEscort === 'Yes') acc[p].escort += 1;
    acc[p].total += 1;
    return acc;
  }, {});

  /* Grouped arrival slots — for the host team's transport planning */
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
    },
    titles: {
      archbishop: archbishopCount,
      bishop: bishopCount,
      clergy: clergyCount,
      lay: layCount,
    },
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
export const buildRegistrationFilter = ({ query, province, status, travelMode, needsTransport, hasPassport, arrivalDate }) => {
  return (r) => {
    if (query) {
      const q = query.trim().toLowerCase();
      if (q) {
        const haystack = [
          r.firstName,
          r.lastName,
          r.title,
          r.position,
          r.otherAffiliation,
          r.diocese,
          r.province,
          r.emailAddress,
          r.whatsappNumber,
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
    return true;
  };
};

/* Build a printable / reportable text block from a set of registrations. */
export const buildPlanningReport = (registrations, { generatedBy = 'Secretariat', eventName = 'Episcopal Consultation' } = {}) => {
  const a = summarizeRegistrations(registrations);
  const stamp = formatDateTime(new Date());
  return {
    title: `${eventName} — Planning Report`,
    generatedAt: stamp,
    generatedBy,
    summary: a.totals,
    titles: a.titles,
    provinces: a.provinceStatusMatrix,
    transport: a.transportByProvince,
    arrivalSlots: a.arrivalSlots,
    travelModes: a.travelModes,
  };
};
