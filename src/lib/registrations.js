const DNDN_FACTS = {
  name: 'Diocese of Niger Delta North',
  province: 'Niger Delta Province, Church of Nigeria (Anglican Communion)',
  bishop: 'The Rt Revd Wisdom Budu Ihunwo',
  cathedral: "St Paul's Cathedral, Diobu, Port Harcourt",
  founded: '1996',
};

export { DNDN_FACTS };

export const normalizeStatus = (status) => status || 'Pending';

export const formatDate = (value) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
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
      return {
        label: 'Approved',
        pill: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Declined':
      return {
        label: 'Declined',
        pill: 'bg-rose-100 text-rose-800 border border-rose-200',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: 'Pending',
        pill: 'bg-amber-100 text-amber-800 border border-amber-200',
        dot: 'bg-amber-500',
      };
  }
};

export const REGISTRATION_EXPORT_COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'position', label: 'Position' },
  { key: 'diocese', label: 'Diocese' },
  { key: 'province', label: 'Province' },
  { key: 'whatsappNumber', label: 'WhatsApp Number' },
  { key: 'emailAddress', label: 'Email Address' },
  { key: 'dateOfArrival', label: 'Date of Arrival', format: (row) => formatDate(row.dateOfArrival) },
  { key: 'modeOfTravel', label: 'Mode of Travel' },
  { key: 'requireInternalTransport', label: 'Require Internal Transport' },
  { key: 'comingWithDriverEscort', label: 'Coming with Driver/Escort' },
  { key: 'driverName', label: 'Driver Name' },
  { key: 'escortName', label: 'Escort Name' },
  { key: 'status', label: 'Status', format: (row) => normalizeStatus(row.status) },
  { key: 'createdAt', label: 'Registration Date', format: (row) => formatDateTime(row.createdAt) },
];

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export const downloadRegistrationsCsv = (rows) => {
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
  link.download = 'episcopal_registrations.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const summarizeRegistrations = (registrations) => {
  const total = registrations.length;
  const approved = registrations.filter((item) => normalizeStatus(item.status) === 'Approved').length;
  const pending = registrations.filter((item) => normalizeStatus(item.status) === 'Pending').length;
  const declined = registrations.filter((item) => normalizeStatus(item.status) === 'Declined').length;
  const transport = registrations.filter((item) => item.requireInternalTransport === 'Yes').length;
  const escorts = registrations.filter((item) => item.comingWithDriverEscort === 'Yes').length;

  const travelModeCounts = registrations.reduce(
    (acc, item) => {
      const key = item.modeOfTravel || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  const arrivalCounts = registrations.reduce((acc, item) => {
    if (!item.dateOfArrival) return acc;
    const sortKey = new Date(item.dateOfArrival).getTime();
    if (Number.isNaN(sortKey)) return acc;
    const key = item.dateOfArrival;
    if (!acc[key]) {
      acc[key] = { date: formatDate(item.dateOfArrival), count: 0, sortKey };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const dioceseCounts = registrations.reduce((acc, item) => {
    const key = item.diocese || 'Unspecified';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totals: {
      total,
      approved,
      pending,
      declined,
      transport,
      escorts,
    },
    statusChart: [
      { name: 'Approved', count: approved, fill: '#0f766e' },
      { name: 'Pending', count: pending, fill: '#d97706' },
      { name: 'Declined', count: declined, fill: '#be123c' },
    ],
    travelModes: Object.entries(travelModeCounts).map(([name, value]) => ({ name, value })),
    arrivals: Object.values(arrivalCounts)
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, 8),
    dioceses: Object.entries(dioceseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
};
