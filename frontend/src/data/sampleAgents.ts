export interface Agent {
  id: string;
  user_id: string;
  license_number?: string;
  company_name?: string;
  bio?: string;
  specialties: string[];
  years_experience: number;
  properties_sold: number;
  rating: number;
  total_reviews: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  // Profile data (from profiles table)
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
}

export const sampleAgents: Agent[] = [
  {
    id: '1',
    user_id: 'user-1',
    license_number: 'REA/LAG/2020/001',
    company_name: 'Prime Realty Solutions',
    bio: 'Experienced real estate professional with over 10 years in the Nigerian property market. Specializing in luxury properties in Lagos and Abuja.',
    specialties: ['Luxury Homes', 'Commercial Properties', 'Land Sales'],
    years_experience: 10,
    properties_sold: 245,
    rating: 4.8,
    total_reviews: 89,
    verification_status: 'verified',
    is_active: true,
    full_name: 'Adebayo Ogunleye',
    email: 'adebayo@primerealty.ng',
    phone: '+234 802 123 4567',
    city: 'Lagos',
    state: 'Lagos',
    avatar_url: 'https://picsum.photos/200/200?random=20',
  },
  {
    id: '2',
    user_id: 'user-2',
    license_number: 'REA/ABJ/2018/045',
    company_name: 'Capital Properties Ltd',
    bio: 'Dedicated to helping clients find their dream homes in Abuja. Expert in residential and commercial real estate.',
    specialties: ['Residential', 'Commercial', 'Property Management'],
    years_experience: 8,
    properties_sold: 180,
    rating: 4.6,
    total_reviews: 67,
    verification_status: 'verified',
    is_active: true,
    full_name: 'Chinwe Okonkwo',
    email: 'chinwe@capitalproperties.ng',
    phone: '+234 803 234 5678',
    city: 'Abuja',
    state: 'FCT',
    avatar_url: 'https://picsum.photos/200/200?random=21',
  },
  {
    id: '3',
    user_id: 'user-3',
    license_number: 'REA/PH/2019/023',
    company_name: 'Port Harcourt Real Estate',
    bio: 'Local expert in Port Harcourt real estate market. Helping clients buy, sell, and rent properties in Rivers State.',
    specialties: ['Residential', 'Land Development', 'Property Investment'],
    years_experience: 6,
    properties_sold: 120,
    rating: 4.7,
    total_reviews: 45,
    verification_status: 'verified',
    is_active: true,
    full_name: 'Emeka Nwosu',
    email: 'emeka@phrealestate.ng',
    phone: '+234 805 345 6789',
    city: 'Port Harcourt',
    state: 'Rivers',
    avatar_url: 'https://picsum.photos/200/200?random=22',
  },
  {
    id: '4',
    user_id: 'user-4',
    license_number: 'REA/LAG/2021/078',
    company_name: 'Lekki Properties Group',
    bio: 'Specializing in high-end properties in Lekki, Victoria Island, and Ikoyi. Expert in luxury real estate transactions.',
    specialties: ['Luxury Homes', 'Beachfront Properties', 'Penthouses'],
    years_experience: 5,
    properties_sold: 95,
    rating: 4.9,
    total_reviews: 52,
    verification_status: 'verified',
    is_active: true,
    full_name: 'Folake Adeyemi',
    email: 'folake@lekkiproperties.ng',
    phone: '+234 807 456 7890',
    city: 'Lagos',
    state: 'Lagos',
    avatar_url: 'https://picsum.photos/200/200?random=23',
  },
  {
    id: '5',
    user_id: 'user-5',
    license_number: 'REA/KAN/2020/012',
    company_name: 'Kano Real Estate Services',
    bio: 'Serving the Kano real estate market with integrity and professionalism. Expert in both residential and commercial properties.',
    specialties: ['Residential', 'Commercial', 'Industrial'],
    years_experience: 7,
    properties_sold: 150,
    rating: 4.5,
    total_reviews: 38,
    verification_status: 'verified',
    is_active: true,
    full_name: 'Ibrahim Musa',
    email: 'ibrahim@kanorealestate.ng',
    phone: '+234 809 567 8901',
    city: 'Kano',
    state: 'Kano',
    avatar_url: 'https://picsum.photos/200/200?random=24',
  },
  {
    id: '6',
    user_id: 'user-6',
    license_number: 'REA/ENU/2022/034',
    company_name: 'Enugu Property Consultants',
    bio: 'Your trusted partner for real estate in Enugu. Helping clients navigate the property market with expert advice.',
    specialties: ['Residential', 'Land Sales', 'Property Valuation'],
    years_experience: 4,
    properties_sold: 75,
    rating: 4.6,
    total_reviews: 28,
    verification_status: 'pending',
    is_active: true,
    full_name: 'Ngozi Eze',
    email: 'ngozi@enuguproperties.ng',
    phone: '+234 812 678 9012',
    city: 'Enugu',
    state: 'Enugu',
    avatar_url: 'https://picsum.photos/200/200?random=25',
  },
];

