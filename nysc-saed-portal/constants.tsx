
import { Instructor, Skill } from './types';

export const NYSC_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/4/4e/Nysc_logo.png";
export const NYSC_LOGO_BACKUP = "https://raw.githubusercontent.com/google/material-design-icons/master/png/social/school/materialicons/48dp/2x/baseline_school_black_48dp.png";

export const COLORS = {
  green: '#004d2c', 
  gold: '#FFCC00',
  white: '#FFFFFF',
  dark: '#1e293b', 
  slate: '#64748b',
  border: '#f1f5f9',
  accent: '#00df82' // Changed from #008751 to a much more vibrant green for contrast
};

export const SKILLS: Skill[] = [
  // ICT & DIGITAL
  { id: 'ict-1', name: 'Web Design', category: 'ICT' },
  { id: 'ict-2', name: 'App Development', category: 'ICT' },
  { id: 'ict-3', name: 'Digital Marketing', category: 'ICT' },
  { id: 'ict-4', name: 'Machine Learning', category: 'ICT' },
  { id: 'ict-5', name: 'Graphic Design', category: 'ICT' },
  { id: 'ict-6', name: 'Cyber Security', category: 'ICT' },
  { id: 'ict-7', name: 'Data Analysis', category: 'ICT' },
  { id: 'ict-8', name: 'Software Engineering', category: 'ICT' },
  
  // AGRO-ALLIED
  { id: 'agro-1', name: 'Agro-allied', category: 'Agro-Allied' },
  { id: 'agro-2', name: 'Poultry Farming', category: 'Agro-Allied' },
  { id: 'agro-3', name: 'Fish Farming (Fisheries)', category: 'Agro-Allied' },
  { id: 'agro-4', name: 'Snailry & Livestock', category: 'Agro-Allied' },
  { id: 'agro-5', name: 'Crop Production & Processing', category: 'Agro-Allied' },

  // COSMETOLOGY
  { id: 'cos-1', name: 'Makeup Artistry', category: 'Cosmetology' },
  { id: 'cos-2', name: 'Hair Styling & Braiding', category: 'Cosmetology' },
  { id: 'cos-3', name: 'Skincare & Organic Products', category: 'Cosmetology' },
  { id: 'cos-4', name: 'Soap & Detergent Making', category: 'Cosmetology' },

  // FASHION & DESIGN
  { id: 'fas-1', name: 'Tailoring & Fashion Design', category: 'Fashion' },
  { id: 'fas-2', name: 'Shoemaking & Cobbling', category: 'Fashion' },
  { id: 'fas-3', name: 'Bags & Leather Works', category: 'Fashion' },

  // FOOD PROCESSING & CONFECTIONERY
  { id: 'food-1', name: 'Baking & Confectionery', category: 'Food Processing' },
  { id: 'food-2', name: 'Catering & Culinary Arts', category: 'Food Processing' },
  { id: 'food-3', name: 'Event Management', category: 'Food Processing' },

  // CULTURE & TOURISM / CREATIVE
  { id: 'cult-1', name: 'Film and Photography', category: 'Creative Arts' },
  { id: 'cult-2', name: 'Bead Making', category: 'Culture & Tourism' },
  { id: 'cult-3', name: 'Hat & Fascinator Making', category: 'Culture & Tourism' },
  { id: 'cult-4', name: 'Interior Decoration', category: 'Culture & Tourism' },

  // CONSTRUCTION
  { id: 'con-1', name: 'Interlocking & Paving', category: 'Construction' },
  { id: 'con-2', name: 'Plumbing & Pipefitting', category: 'Construction' },
  { id: 'con-3', name: 'Masonry & Tiling', category: 'Construction' },
  { id: 'con-4', name: 'POP & Painting', category: 'Construction' },

  // POWER & ENERGY
  { id: 'pow-1', name: 'Solar Installation', category: 'Power & Energy' },
  { id: 'pow-2', name: 'Electrical Wiring', category: 'Power & Energy' },

  // ENVIRONMENT
  { id: 'env-1', name: 'Waste Management (Waste to Wealth)', category: 'Environment' },
  { id: 'env-2', name: 'Landscaping & Horticulture', category: 'Environment' },

  // EDUCATION
  { id: 'edu-1', name: 'Teaching Methodology', category: 'Education' },
];

export const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const NIGERIA_LGAS: Record<string, string[]> = {
  'Lagos': ['Ikeja', 'Alimosho', 'Oshodi-Isolo', 'Lagos Island', 'Kosofe', 'Eti-Osa', 'Surulere', 'Badagry', 'Ikorodu', 'Epe'],
  'FCT - Abuja': ['Abuja Municipal', 'Gwagwalada', 'Kuje', 'Bwari', 'Kwali', 'Abaji'],
  'Kano': ['Tarauni', 'Nasarawa', 'Fagge', 'Kumbotso', 'Gwale', 'Kano Municipal'],
  'Rivers': ['Obio-Akpor', 'Port Harcourt', 'Eleme', 'Bonny', 'Ikwerre', 'Okrika'],
  'Oyo': ['Ibadan North', 'Ibadan South', 'Ibadan East', 'Ibadan West', 'Ogbomosho North', 'Ogbomosho South'],
  'Kaduna': ['Kaduna North', 'Kaduna South', 'Chikun', 'Igabi', 'Zaria', 'Sabon Gari'],
  'Default': ['Central LGA', 'Northern LGA', 'Southern LGA', 'Eastern LGA', 'Western LGA']
};

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Michael Ade',
    email: 'michael.ade@nysc.gov.ng',
    headline: 'WEB DESIGNER | SOFTWARE DEV.',
    about: 'Expert mentor with over 10 years experience in tech education.',
    profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop',
    skills: ['Web Design', 'Graphic Design', 'Software Engineering'],
    rating: 5.0,
    reviewCount: 0,
    phoneNumber: '+234 803 123 4567',
    location: {
      lat: 9.0765,
      lng: 7.3986,
      address: 'Aladinz Academy',
      state: 'Kaduna',
      lga: 'Chikun'
    },
    linkedInUrl: 'https://linkedin.com/',
    status: 'APPROVED',
    verified: true
  },
  {
    id: 'inst-2',
    name: 'Mrs. Chidimma Okeke',
    email: 'chidimma.okeke@nysc.gov.ng',
    headline: 'Creative Director | Fashion Designer',
    about: 'Leading instructor in the creative sector specializing in modern tailoring.',
    profilePic: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&h=400&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    skills: ['Tailoring & Fashion Design', 'Hat & Fascinator Making'],
    rating: 5.0,
    reviewCount: 95,
    phoneNumber: '+234 812 987 6543',
    location: {
      lat: 6.5244,
      lng: 3.3792,
      address: '32 Herbert Macaulay Way, Yaba',
      state: 'Lagos',
      lga: 'Surulere'
    },
    linkedInUrl: 'https://linkedin.com/',
    status: 'APPROVED',
    verified: true
  }
];
