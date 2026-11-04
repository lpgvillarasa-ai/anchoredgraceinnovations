// The five example businesses in the hero switcher. All carry the AGI name, never a
// made-up business name (Lee 2026-11-04), and every address is labelled "(example)".
// None of the .ph addresses was registered when chosen (checked 2026-11-04).
export type Industry = {
  id: string;
  tab: string;
  brand: string;
  domain: string;
  headline: string;
  cta: string;
  color: string;
  features: string[];
  phoneTitle: string;
  phoneRows: [string, string][];
};

export const INDUSTRIES: Industry[] = [
  {
    id: 'clinic', tab: 'Clinic', brand: 'AGI CLINIC', domain: 'agiclinic.ph', headline: 'Glow, booked in seconds.', cta: 'Book a treatment', color: '#3E2F2A',
    features: ['Public website with price list', 'Online booking calendar', 'Point of sale and commissions', 'AI assistant for front desk'],
    phoneTitle: 'Pick a time for your facial', phoneRows: [['Hydrafacial', '10:00 AM'], ['Laser session', '1:30 PM'], ['Consultation', '4:00 PM']],
  },
  {
    id: 'gym', tab: 'Gym', brand: 'AGI FITNESS', domain: 'agifitness.ph', headline: 'Train harder. Sign up faster.', cta: 'Start membership', color: '#1E2A22',
    features: ['Membership sign-up and payments', 'Class schedule and booking', 'QR check-in at the door', 'AI replies to member chats'],
    phoneTitle: "Today's classes", phoneRows: [['HIIT', '6:00 AM'], ['Strength', '12:00 PM'], ['Spin', '7:00 PM']],
  },
  {
    id: 'restaurant', tab: 'Restaurant', brand: 'AGI KITCHEN', domain: 'agikitchen.ph', headline: 'Reserve a table tonight.', cta: 'Reserve a table', color: '#4A2A1C',
    features: ['Menu with photos and prices', 'Table reservations', 'Online ordering and pickup', 'POS and inventory'],
    phoneTitle: 'Tables for tonight', phoneRows: [['Table for 2', '6:30 PM'], ['Table for 4', '7:15 PM'], ['Table for 6', '8:00 PM']],
  },
  {
    id: 'church', tab: 'Church', brand: 'AGI CHURCH', domain: 'agichurch.ph', headline: 'Find your Sunday home.', cta: 'Plan a visit', color: '#232B3D',
    features: ['Service times and livestream', 'Event tickets with QR', 'Online giving', 'Member and volunteer app'],
    phoneTitle: 'This week', phoneRows: [['Sunday service', '9:00 AM'], ['Youth night', 'Fri 7 PM'], ['Anniversary event', 'Get tickets']],
  },
  {
    id: 'retail', tab: 'Retail', brand: 'AGI SHOP', domain: 'agishop.ph', headline: 'Shop local. Delivered.', cta: 'Shop now', color: '#3A3324',
    features: ['Online shop with payments', 'Inventory synced to the store', 'POS for the counter', 'AI answers product questions'],
    phoneTitle: 'Your cart', phoneRows: [['Woven basket', '₱850'], ['Rattan lamp', '₱2,400'], ['Delivery', 'Free']],
  },
];
