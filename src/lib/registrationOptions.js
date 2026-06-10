/* ---------------------------------------------------------------------------
   Anglican Church of Nigeria — administrative mapping.
   14 provinces × 176 dioceses (per Church of Nigeria records).
   18 honorifics + an "Other (specify)" escape hatch.
   9 standalone "Other" bodies (theological colleges, missionary dioceses,
   CONNAM, etc.) — surfaced when the delegate picks "Other (specify)" for
   province. Cascading select: province → diocese; if province is "Other",
   the next field is a "Body" select with the 9 standalone bodies + a free-
   text fallback.

   Source of truth: church_of_nigeria_normalized_registration_options.md
   --------------------------------------------------------------------------- */

export const HONORIFICS = [
  'Mr.',
  'Mrs.',
  'Ms.',
  'Dr.',
  'Prof.',
  'Sir.',
  'Dame',
  'Evang.',
  "Rev'd",
  "Rev'd Dr.",
  'Canon',
  'Canon Dr.',
  'Ven.',
  'Ven. Dr.',
  "Rt. Rev'd",
  "Rt. Rev'd Dr.",
  "Most Rev'd",
  "Most Rev'd Dr.",
];

/* Append "Other (specify)" so users can type a custom honorific. */
export const HONORIFICS_OPTIONS = [...HONORIFICS, 'Other (specify)'];

export const HONORIFIC_OTHER = 'Other (specify)';

export const PROVINCE_DIOCESE_MAP = {
  'Province of Aba': [
    'Aba',
    'Aba Ngwa North',
    'Arochukwu/Ohafia',
    'Ikwuano',
    'Isiala Ngwa',
    'Isiala-Ngwa South',
    'Isikwuato',
    'Ukwa',
    'Umuahia',
  ],
  'Province of Abuja': [
    'Abuja',
    'Gboko',
    'Gwagwalada',
    'Kafanchan',
    'Keffi-Karshi',
    'Kubwa',
    'Kwoi',
    'Lafia',
    'Makurdi',
    'Nasarawa',
    'Otukpo',
    'Zaki-Biam',
    'Zonkwa',
  ],
  'Province of Bendel': [
    'Akoko Edo',
    'Asaba',
    'Benin',
    'Esan',
    'Etsako',
    'Ika',
    'Ndokwa',
    'Oleh',
    'Ozoro',
    'Sabongidda-Ora',
    'Sapele',
    'Ughelli',
    'Warri',
    'Western Izon',
  ],
  'Province of Enugu': [
    'Abakaliki',
    'Afikpo',
    'Awgu/Aninri',
    'Eha-Amufu',
    'Enugu',
    'Enugu North',
    'Ikwo',
    'Ngbo',
    'Nike',
    'Nsukka',
    'Oji River',
    'Udi',
  ],
  'Province of Ibadan': [
    'Ajayi Crowther',
    'Ibadan',
    'Ibadan North',
    'Ibadan South',
    'Ife',
    'Ife East',
    'Ijesha North',
    'Ijesa North East',
    'Ilesa',
    'Ilesa South West',
    'Ogbomoso',
    'Oke-Ogun',
    'Oke-Osun',
    'Osun',
    'Osun North',
    'Osun North East',
    'Oyo',
    'Oyo South',
  ],
  'Province of Jos': [
    'Bauchi',
    'Bukuru',
    'Damaturu',
    'Gombe',
    'Jalingo',
    'Jos',
    'Langtang',
    'Maiduguri',
    'Pankshin',
    'Takum',
    'Yola',
  ],
  'Province of Kaduna': [
    'Bari',
    'Dutse',
    'Gusau',
    'Ikara',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Sokoto',
    'Wusasa',
    'Zaria',
    'Zuru',
  ],
  'Province of Kwara': [
    'Ekiti Kwara',
    'Igbomina',
    'Igbomina West',
    'Jebba',
    'Kwara',
    'New Bussa',
    'Offa',
    'Omu-Aran',
    'Oyun',
  ],
  'Province of Lagos': [
    'Awori',
    'Badagry',
    'Egba',
    'Egba West',
    'Ifo',
    'Ijebu',
    'Ijebu North',
    'Ijebu South West',
    'Lagos',
    'Lagos Mainland',
    'Lagos South West',
    'Lagos West',
    'Remo',
    'Yewa',
  ],
  'Province of Lokoja': [
    'Bida',
    'Doko',
    'Idah',
    'Ijumu',
    'Kabba',
    'Kontagora',
    'Kutigi',
    'Lokoja',
    'Minna',
    'Ogori-Magongo',
    'Okene',
  ],
  'Province of the Niger': [
    'Aguata',
    'Amichi',
    'Awka',
    'Ihiala',
    'Niger East / Mbamili',
    'Niger West',
    'Nnewi',
    'Ogbaru',
    'On the Niger',
  ],
  'Province of Niger Delta': [
    'Ahoada',
    'Calabar',
    'Eket',
    'Etche',
    'Evo',
    'Ikom',
    'Ikwerre',
    'Kalabari',
    'Niger Delta',
    'Niger Delta North',
    'Niger Delta West',
    'Northern Izon',
    'Ogbia',
    'Ogoja',
    'Ogoni',
    'Okrika',
    'Omoku',
    'Uyo',
  ],
  'Province of Ondo': [
    'Akoko',
    'Akure',
    'Diocese on the Coast',
    'Ekiti',
    'Ekiti Oke',
    'Ekiti South',
    'Ekiti West',
    'Idanre',
    'Idoani',
    'Ilaje',
    'Ile-Oluji',
    'Irele-Eseodo',
    'Ondo',
    'Owo',
  ],
  'Province of Owerri': [
    'Egbu',
    'Ideato',
    'Ikeduru',
    'Isi Mbano / Isimbano',
    'Mbaise',
    'Ohaji/Egbema',
    'Okigwe',
    'Okigwe South',
    'On the Lake',
    'Orlu',
    'Oru',
    'Owerri',
  ],
};

/* Standalone bodies that don't sit under any province — theological
   colleges, missionary dioceses, and a couple of administrative units.
   Surfaced when the delegate picks "Other (specify)" for province. */
export const OTHERS_BODIES = [
  'Archbishop Vining College of Theology, Akure',
  'Bishop Crowther College of Theology, Okene',
  'CONNAM',
  'Crowther Graduate Theological Seminary, Abeokuta',
  'Immanuel College of Theology, Ibadan',
  'Nomadic',
  'St. Francis of Assisi, Wusasa',
  'Administrative Diocese Omambala',
  'Southern Kaduna Missionary Diocese',
];

export const OTHERS_BODIES_OPTIONS = [...OTHERS_BODIES, 'Other (specify)'];

export const PROVINCE_OPTIONS = [
  ...Object.keys(PROVINCE_DIOCESE_MAP),
  'Other (specify)',
];

export const PROVINCE_OTHER = 'Other (specify)';

export const getDiocesesForProvince = (province) => {
  if (!province) return [];
  if (province === PROVINCE_OTHER) return [];
  return PROVINCE_DIOCESE_MAP[province] || [];
};

/* Travel & transport enums */
export const TRAVEL_MODES = [
  { value: 'Air', label: 'Air' },
  { value: 'Road', label: 'Road' },
  { value: 'Rail', label: 'Rail' },
];

export const YES_NO = [
  { value: 'No', label: 'No' },
  { value: 'Yes', label: 'Yes' },
];

/* VIP/protocol levels — used by the protocol briefing page. */
export const VIP_LEVELS = [
  { value: 'regular', label: 'Delegate', description: 'Standard delegate' },
  { value: 'dignitary', label: 'Dignitary', description: 'Senior cleric or honoured guest' },
  { value: 'archbishop', label: 'Archbishop / Primate', description: 'Primate or Archbishop — highest protocol' },
  { value: 'special', label: 'Special Guest', description: 'Lay leader, faculty, honoured visitor' },
];
