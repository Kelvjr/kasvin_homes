export interface Apartment {
  id: string;
  code: string;
  slug: string;
  name: string;
  tagline: string;
  unitPosition: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeSqm: number;
  nightlyRateGhs: number;
  currency: 'GHS';
  shortDescription: string;
  description: string[];
  heroImage: string;
  gallery: { url: string; caption: string }[];
  amenities: string[];
  highlights: string[];
  houseRules: string[];
  blockedDaysOfMonth: number[];
}

export interface GuestService {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  pricingNote: string;
  highlights: string[];
  availability: string;
}

export interface GuestReview {
  id: string;
  guestName: string;
  origin: string;
  apartment: string;
  rating: number;
  quote: string;
  stayDate: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'Booking & Payment' | 'Stay & Check-in' | 'Services';
}

export const APARTMENTS: Apartment[] = [
  {
    id: 'sirius-residence',
    code: 'SIRIUS',
    slug: 'sirius',
    name: 'The Sirius Residence',
    tagline: 'Elevated two-bedroom living bathed in warm golden light.',
    unitPosition: 'Middle Floor',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    sizeSqm: 118,
    nightlyRateGhs: 900,
    currency: 'GHS',
    shortDescription:
      'An expansive middle-floor two-bedroom residence crafted for families, executives, and extended stays who value calm, space, and architectural warmth.',
    description: [
      'Positioned on the middle floor for an effortless balance of privacy and elevation, The Sirius Residence welcomes you into an open-plan living and dining salon anchored by warm cream upholstery, deep ocean-teal accents, and bespoke brass lighting.',
      'Two generously proportioned bedrooms—each dressed in crisp high-thread-count cotton—are paired with spa-inspired en-suite bathrooms, blackout drapery, and whisper-quiet air conditioning. A fully equipped modern kitchen and dedicated dining space make hosting or unwinding equally effortless.',
    ],
    heroImage: '/images/sirius-residence.jpg',
    gallery: [
      {
        url: '/images/sirius-residence.jpg',
        caption: 'Open-plan living & dining salon',
      },
      {
        url: '/images/hero-residence.jpg',
        caption: 'Golden hour lounge terrace',
      },
      { url: '/images/eos-suite.jpg', caption: 'Primary bedroom sanctuary' },
      {
        url: '/images/apollo-suite.jpg',
        caption: 'Evening study & reading corner',
      },
    ],
    amenities: [
      'High-speed Fibre Wi-Fi',
      'Full Inverter Backup Power',
      '24/7 Manned Security & CCTV',
      'Fully Equipped Kitchen',
      'Smart TV with Streaming',
      'Air Conditioning in All Rooms',
      'Washer & Laundry Essentials',
      'Dedicated Workspace',
      'Private Parking Bay',
      'Complimentary Bottled Water',
    ],
    highlights: [
      'Middle floor with elevated views',
      '2 spacious bedrooms & 2 full bathrooms',
      'Ideal for up to 4 guests',
      'Full dining table for 6',
    ],
    houseRules: [
      'Check-in from 3:00 PM · Check-out by 11:00 AM',
      'No smoking inside the residence',
      'Quiet hours observed between 10:00 PM and 7:00 AM',
      'No unregistered overnight guests or parties',
    ],
    blockedDaysOfMonth: [4, 5, 6, 14, 15, 22, 23],
  },
  {
    id: 'emerald-residence',
    code: 'EMERALD',
    slug: 'emerald',
    name: 'The Emerald Residence',
    tagline: 'Serene ground-floor sanctuary with effortless courtyard flow.',
    unitPosition: 'Ground Floor',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    sizeSqm: 124,
    nightlyRateGhs: 900,
    currency: 'GHS',
    shortDescription:
      'A tranquil ground-floor two-bedroom residence with step-free access, sunlit travertine floors, and an airy resort-inspired living space.',
    description: [
      'Designed for effortless arrival and indoor-outdoor calm, The Emerald Residence occupies the ground floor with wide glazing that frames lush tropical greenery. Natural oak cabinetry, warm stone textures, and soft cream linens create an immediate sense of sanctuary.',
      'Whether you are travelling with family, colleagues, or simply desire generous living quarters without stairs, Emerald offers two serene bedrooms, two modern bathrooms, a complete chef-ready kitchen, and direct access to outdoor seating.',
    ],
    heroImage: '/images/emerald-residence.jpg',
    gallery: [
      {
        url: '/images/emerald-residence.jpg',
        caption: 'Sunlit living room & garden outlook',
      },
      { url: '/images/hero-residence.jpg', caption: 'Warm afternoon lounge' },
      {
        url: '/images/sirius-residence.jpg',
        caption: 'Dining & entertaining space',
      },
      { url: '/images/eos-suite.jpg', caption: 'Restful master suite' },
    ],
    amenities: [
      'Step-Free Ground-Floor Access',
      'High-speed Fibre Wi-Fi',
      'Full Inverter Backup Power',
      '24/7 Manned Security & CCTV',
      'Fully Equipped Kitchen',
      'Smart TV with Streaming',
      'Air Conditioning in All Rooms',
      'Washer & Ironing Facilities',
      'Private Parking Bay',
      'Outdoor Seating Access',
    ],
    highlights: [
      'Convenient ground-floor access',
      '2 spacious bedrooms & 2 full bathrooms',
      'Ideal for families & up to 4 guests',
      'Lush courtyard greenery',
    ],
    houseRules: [
      'Check-in from 3:00 PM · Check-out by 11:00 AM',
      'No smoking inside the residence',
      'Quiet hours observed between 10:00 PM and 7:00 AM',
      'No unregistered overnight guests or parties',
    ],
    blockedDaysOfMonth: [2, 3, 11, 12, 18, 19, 20],
  },
  {
    id: 'eos-suite',
    code: 'EOS',
    slug: 'eos',
    name: 'The Eos Suite',
    tagline: 'Sunlit front-facing one-bedroom suite inspired by morning light.',
    unitPosition: 'Front',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    sizeSqm: 68,
    nightlyRateGhs: 600,
    currency: 'GHS',
    shortDescription:
      'A luminous front-facing one-bedroom suite with warm timber accents, Egyptian cotton bedding, and an intimate lounge tailored for solo travellers or couples.',
    description: [
      'Named after the dawn, The Eos Suite captures soft morning light through its front-facing aspect. Crisp ivory linens, burnt-coral accents, and sculptural lighting come together in a space that feels like a private boutique hotel suite.',
      'Complete with a plush king-size bed, sleek rain-shower bathroom, thoughtfully appointed kitchenette, and a quiet desk nook for remote work, Eos is the ideal home base for business trips and romantic city escapes.',
    ],
    heroImage: '/images/eos-suite.jpg',
    gallery: [
      { url: '/images/eos-suite.jpg', caption: 'Sun-drenched king bedroom' },
      { url: '/images/hero-residence.jpg', caption: 'Warm lounge & seating' },
      { url: '/images/apollo-suite.jpg', caption: 'Evening ambiance' },
    ],
    amenities: [
      'High-speed Fibre Wi-Fi',
      'Full Inverter Backup Power',
      '24/7 Manned Security & CCTV',
      'Modern Kitchenette',
      'Smart TV with Streaming',
      'Air Conditioning',
      'Dedicated Work Desk',
      'Private Parking Bay',
    ],
    highlights: [
      'Front-facing sunlit position',
      '1 king bedroom & 1 spa bathroom',
      'Tailored for 1–2 guests',
      'Effortless business or leisure stay',
    ],
    houseRules: [
      'Check-in from 3:00 PM · Check-out by 11:00 AM',
      'No smoking inside the suite',
      'Quiet hours observed between 10:00 PM and 7:00 AM',
      'No unregistered overnight guests or parties',
    ],
    blockedDaysOfMonth: [7, 8, 15, 16, 25, 26],
  },
  {
    id: 'apollo-suite',
    code: 'APOLLO',
    slug: 'apollo',
    name: 'The Apollo Suite',
    tagline: 'Intimate designer one-bedroom sanctuary for restorative stays.',
    unitPosition: 'Corridor',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    sizeSqm: 64,
    nightlyRateGhs: 600,
    currency: 'GHS',
    shortDescription:
      'A quiet, tucked-away one-bedroom suite featuring moody teal tones, warm limestone textures, and curated comfort for uninterrupted rest.',
    description: [
      'Tucked quietly along the private corridor, The Apollo Suite is designed as a restorative cocoon away from the rhythm of the city. Deep ocean-teal walls, warm limestone finishes, and soft ambient lighting create a deeply calming evening atmosphere.',
      'Enjoy a restful king bed, modern walk-in shower, well-equipped kitchenette, reliable high-speed internet, and seamless 24-hour power—everything you need for a focused work trip or unhurried weekend retreat.',
    ],
    heroImage: '/images/apollo-suite.jpg',
    gallery: [
      {
        url: '/images/apollo-suite.jpg',
        caption: 'Intimate architectural lounge',
      },
      { url: '/images/eos-suite.jpg', caption: 'Plush king sleeping quarters' },
      {
        url: '/images/hero-residence.jpg',
        caption: 'Natural daylight accents',
      },
    ],
    amenities: [
      'High-speed Fibre Wi-Fi',
      'Full Inverter Backup Power',
      '24/7 Manned Security & CCTV',
      'Modern Kitchenette',
      'Smart TV with Streaming',
      'Air Conditioning',
      'Dedicated Work Desk',
      'Private Parking Bay',
    ],
    highlights: [
      'Quiet corridor sanctuary',
      '1 king bedroom & 1 modern bathroom',
      'Tailored for 1–2 guests',
      'Moody, restful evening lighting',
    ],
    houseRules: [
      'Check-in from 3:00 PM · Check-out by 11:00 AM',
      'No smoking inside the suite',
      'Quiet hours observed between 10:00 PM and 7:00 AM',
      'No unregistered overnight guests or parties',
    ],
    blockedDaysOfMonth: [1, 2, 13, 14, 21, 22],
  },
];

export const SERVICES: GuestService[] = [
  {
    id: 'food-catering',
    slug: 'food-catering',
    title: 'Food & Private Catering',
    subtitle: 'Curated Ghanaian & continental dining, delivered to your door',
    description:
      'Enjoy freshly prepared breakfast, lunch, and dinner options without leaving the comfort of your residence. We coordinate directly with vetted culinary partners so your meals arrive hot, beautifully presented, and tailored to your dietary preferences.',
    image: '/images/service-catering.jpg',
    pricingNote: 'Custom menu pricing · Confirmed upon request',
    highlights: [
      'Curated breakfast, lunch & dinner menus',
      'Authentic Ghanaian dishes & continental favourites',
      'Request during checkout or anytime during your stay',
      'Arranged seamlessly through trusted culinary partners',
    ],
    availability: 'Available daily with advance notice',
  },
  {
    id: 'airport-transfers',
    slug: 'airport-transfers',
    title: 'Transportation & Airport Transfers',
    subtitle: 'Seamless Kotoka Airport pickups, drop-offs & local chauffeuring',
    description:
      'Arrive and depart in complete calm. Our concierge arranges punctual airport pickups, drop-offs, and private city transfers with professional drivers and air-conditioned executive vehicles—with transparent pricing confirmed before every trip.',
    image: '/images/service-transfer.jpg',
    pricingNote: 'Trip-based quote · Confirmed before dispatch',
    highlights: [
      'Meet-and-greet Kotoka International Airport pickups',
      'Reliable departure drop-offs & flight tracking',
      'Local city transfers for meetings & dining',
      'Clean, air-conditioned executive SUVs & sedans',
    ],
    availability: '24/7 by advance reservation',
  },
  {
    id: 'car-rental',
    slug: 'car-rental',
    title: 'Car Rental Arrangements',
    subtitle:
      'Flexible self-drive or chauffeur-driven vehicles via trusted partners',
    description:
      'Explore Ghana at your own pace. We coordinate vehicle options, rental durations, and transparent pricing enquiries through vetted third-party rental partners—whether you need a sleek city sedan or a rugged SUV for weekend coastal escapes.',
    image: '/images/service-car-rental.jpg',
    pricingNote: 'Daily & weekly rates · Refundable security deposit may apply',
    highlights: [
      'Executive sedans, compact SUVs & 4x4 options',
      'Flexible daily or multi-day rental durations',
      'Self-drive or dedicated chauffeur options',
      'Clear terms & refundable security deposit guidance',
    ],
    availability: 'Arranged with 24 hours advance notice',
  },
];

export const GUEST_REVIEWS: GuestReview[] = [
  {
    id: 'rev-1',
    guestName: 'Abena M.',
    origin: 'London, UK',
    apartment: 'The Sirius Residence',
    rating: 5,
    quote:
      'Walking into Sirius felt like stepping into a design magazine. Spotless, calm, reliable Wi-Fi for my remote calls, and the airport pickup was waiting the moment I landed.',
    stayDate: 'October 2026',
  },
  {
    id: 'rev-2',
    guestName: 'Kwame O.',
    origin: 'New York, USA',
    apartment: 'The Emerald Residence',
    rating: 5,
    quote:
      'We stayed a week with family and loved the ground-floor convenience. Having breakfast arranged on our first morning made our arrival effortless. Truly five-star Ghanaian hospitality.',
    stayDate: 'September 2026',
  },
  {
    id: 'rev-3',
    guestName: 'Nadia T.',
    origin: 'Lagos, Nigeria',
    apartment: 'The Eos Suite',
    rating: 5,
    quote:
      'The morning light in Eos is unforgettable. Everything works seamlessly—power, AC, water pressure, and the concierge answered every WhatsApp message within minutes.',
    stayDate: 'August 2026',
  },
];

export const LOCAL_RECOMMENDATIONS = [
  {
    category: 'Dining & Cafés',
    items: [
      'Artisanal coffee & pastry roasteries within 10 minutes',
      'Contemporary West African fine dining & grill lounges',
      'Fresh seafood and coastal terrace restaurants',
    ],
  },
  {
    category: 'Culture & Leisure',
    items: [
      'Contemporary Ghanaian art galleries & craft markets',
      'Scenic coastal walks and weekend beach clubs',
      'Live highlife, jazz, and acoustic evening venues',
    ],
  },
  {
    category: 'Everyday Essentials',
    items: [
      '24-hour pharmacies and international supermarkets',
      'Modern fitness studios and wellness spas nearby',
      'Quick access to major business districts and Kotoka Airport',
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    category: 'Booking & Payment',
    question: 'How does booking and payment work?',
    answer:
      'Select your dates and preferred residence, enter your guest details (no account required), and complete 100% upfront payment securely online via Paystack. You receive an instant booking reference and confirmation as soon as payment is verified.',
  },
  {
    category: 'Booking & Payment',
    question: 'Do I need to create an account to book?',
    answer:
      'No. Guest accounts are completely optional so you can book in minutes without friction.',
  },
  {
    category: 'Booking & Payment',
    question: 'Are multi-night discounts available?',
    answer:
      'Yes. Extended stays of 5+ nights and seasonal promotions automatically reflect in your booking cost breakdown before you pay.',
  },
  {
    category: 'Stay & Check-in',
    question: 'What are the check-in and check-out times?',
    answer:
      'Standard check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in or late check-out can be requested in advance via WhatsApp subject to availability.',
  },
  {
    category: 'Stay & Check-in',
    question: 'Is there backup power and reliable Wi-Fi?',
    answer:
      'Yes. All four residences feature uninterrupted backup power and high-speed fibre Wi-Fi suitable for video calls and remote work.',
  },
  {
    category: 'Services',
    question:
      'Can I request catering, airport pickup, or car rental after booking?',
    answer:
      'Absolutely. You can add service requests during checkout or message our concierge anytime after your booking is confirmed.',
  },
];

export function formatGhs(amount: number): string {
  return `GH₵${amount.toLocaleString('en-GH')}`;
}

export function getApartmentBySlug(slug: string): Apartment | undefined {
  return APARTMENTS.find((apt) => apt.slug === slug);
}
