// Comprehensive knowledge base for the chatbot

export interface KnowledgeEntry {
  question: string[];
  answer: string;
  category: string;
  keywords: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  // CRM Questions
  {
    question: ['What is the CRM feature?', 'What is CRM?', 'Tell me about CRM'],
    answer: 'Our CRM (Customer Relationship Management) system automatically creates leads from property inquiries, helps you track all client interactions, manage your sales pipeline, and close more deals. Every time someone inquires about your property, a lead is automatically created in your CRM.',
    category: 'CRM',
    keywords: ['crm', 'customer relationship', 'lead management', 'client management']
  },
  {
    question: ['How does automatic lead creation work?', 'How are leads created?', 'Automatic leads'],
    answer: 'When a buyer sends a message about your property, our system automatically creates a lead in your CRM. The lead includes their name, email, phone, and the property they\'re interested in. You can then track this lead through your sales pipeline from inquiry to closing.',
    category: 'CRM',
    keywords: ['automatic', 'lead creation', 'inquiry', 'message', 'property inquiry']
  },
  {
    question: ['Can I track activities and notes?', 'How do I add notes?', 'Activity tracking'],
    answer: 'Yes! You can add activities (calls, meetings, viewings, emails) and notes for each lead. This helps you keep track of all interactions and never miss a follow-up. You can also mark notes as important or private.',
    category: 'CRM',
    keywords: ['activities', 'notes', 'tracking', 'follow-up', 'interactions']
  },
  {
    question: ['Is CRM free?', 'How much does CRM cost?', 'CRM pricing'],
    answer: 'Yes! The CRM feature is included for all agents, even on the free plan. You get automatic lead creation, activity tracking, notes, and pipeline management at no extra cost.',
    category: 'CRM',
    keywords: ['free', 'cost', 'price', 'pricing', 'included']
  },
  {
    question: ['How do I access CRM?', 'Where is the CRM?', 'CRM dashboard'],
    answer: 'Once you\'re logged in as an agent, go to your Agent Dashboard and click "Manage Leads" in the sidebar, or navigate to /agent/leads. Your CRM shows all leads, activities, and pipeline statistics.',
    category: 'CRM',
    keywords: ['access', 'where', 'dashboard', 'agent dashboard', 'leads']
  },

  // Verification Questions
  {
    question: ['What does verified mean?', 'What is verification?', '100% verified'],
    answer: 'All properties and agents on our platform are verified. Agents must submit their real estate license and government ID. Properties are verified for authenticity. This ensures no scams or fake listings - only real, verified properties and trusted agents.',
    category: 'Verification',
    keywords: ['verified', 'verification', 'authentic', 'real', 'trusted']
  },
  {
    question: ['How long does verification take?', 'Verification time', 'How fast is verification?'],
    answer: 'Standard verification takes 2-5 business days. For ₦5,000, you can get priority verification within 24 hours. We review all documents carefully to ensure authenticity and safety.',
    category: 'Verification',
    keywords: ['time', 'how long', 'days', 'priority', 'fast']
  },
  {
    question: ['Do I need verification?', 'Is verification required?', 'Must I verify?'],
    answer: 'Agents must be verified to list properties. Sellers can list properties, but verification is recommended for better visibility and trust. All properties go through a verification process to prevent scams.',
    category: 'Verification',
    keywords: ['required', 'need', 'must', 'recommended', 'must verify']
  },
  {
    question: ['What documents do I need?', 'Verification documents', 'What to submit'],
    answer: 'For agents: You need a valid Real Estate Agent License (REA license) and a government-issued ID (National ID, Passport, Driver\'s License, or Voter\'s Card). You can also submit professional credentials. All documents are reviewed by our admin team.',
    category: 'Verification',
    keywords: ['documents', 'papers', 'license', 'id', 'credentials']
  },

  // Pricing Questions
  {
    question: ['What payment methods?', 'How can I pay?', 'Payment options'],
    answer: 'We accept all major payment methods through Paystack, including bank transfers, debit/credit cards, and mobile money. All payments are secure and processed in Nigerian Naira (₦).',
    category: 'Pricing',
    keywords: ['payment', 'pay', 'methods', 'paystack', 'card', 'bank']
  },
  {
    question: ['Can I cancel subscription?', 'Cancel anytime?', 'How to cancel'],
    answer: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access to premium features until the end of your billing period. No cancellation fees or penalties.',
    category: 'Pricing',
    keywords: ['cancel', 'subscription', 'stop', 'end', 'terminate']
  },
  {
    question: ['What happens if I cancel?', 'After cancellation', 'Cancel effects'],
    answer: 'Your listings remain active, but you\'ll lose premium features like featured placement, priority support, and unlimited listings. You\'ll revert to the free plan limits (3 properties for sellers, 5 for agents).',
    category: 'Pricing',
    keywords: ['cancel', 'after', 'what happens', 'effects', 'lose']
  },
  {
    question: ['Free vs Premium?', 'What\'s the difference?', 'Plan comparison'],
    answer: 'Free plans allow limited listings (3 for sellers, 5 for agents) with basic features. Premium plans offer unlimited listings, featured placement, priority support, analytics, and more. All plans include CRM for agents and verification.',
    category: 'Pricing',
    keywords: ['free', 'premium', 'difference', 'compare', 'plans']
  },
  {
    question: ['How much does it cost?', 'What are the prices?', 'Pricing plans'],
    answer: 'For sellers: Free (₦0), Premium (₦5,000/month), Enterprise (₦15,000/month). For agents: Free (₦0), Professional (₦10,000/month). Featured listings cost ₦2,000 per property per month. Priority verification is ₦5,000 one-time.',
    category: 'Pricing',
    keywords: ['cost', 'price', 'how much', 'pricing', 'plans', 'fee']
  },

  // Property Listing Questions
  {
    question: ['What property types?', 'What can I list?', 'Property types supported'],
    answer: 'You can list Houses, Apartments, Condos, Townhouses, Land, Commercial properties, Shortlets, and Airbnb rentals. We support all property types and listing types (sale, rent, lease, short stay, Airbnb).',
    category: 'Properties',
    keywords: ['property types', 'list', 'what can', 'houses', 'apartments', 'shortlets']
  },
  {
    question: ['How many photos?', 'Photo limit', 'How many pictures'],
    answer: 'Free plans allow up to 10 photos per property. Premium and Enterprise plans allow up to 20 photos, and Enterprise allows unlimited photos. All photos are protected and cannot be downloaded.',
    category: 'Properties',
    keywords: ['photos', 'pictures', 'images', 'limit', 'how many']
  },
  {
    question: ['What is featured listing?', 'Featured property', 'Featured badge'],
    answer: 'Featured listings appear at the top of search results with a special badge. They get 3x more views on average. Featured listings cost ₦2,000 per property per month and are included in Premium/Enterprise plans.',
    category: 'Properties',
    keywords: ['featured', 'badge', 'top', 'promoted', 'highlighted']
  },
  {
    question: ['Can I list shortlets?', 'Airbnb support', 'Shortlet properties'],
    answer: 'Yes! We fully support shortlets and Airbnb rentals. You can select "Shortlet" or "Airbnb" as your property type and listing type. These properties get the same features as regular listings.',
    category: 'Properties',
    keywords: ['shortlet', 'airbnb', 'short stay', 'rental', 'temporary']
  },
  {
    question: ['How do I list property?', 'Create listing', 'Add property'],
    answer: 'Sign up as a seller, go to Seller Dashboard, and click "Create New Property". Fill in all property details, upload photos, set your price, and submit. Your property will be reviewed and verified before going live.',
    category: 'Properties',
    keywords: ['list', 'create', 'add', 'new property', 'post', 'upload']
  },
  {
    question: ['Can I edit property?', 'Edit listing', 'Update property'],
    answer: 'Yes! You can edit your property details, photos, and pricing anytime from your Seller Dashboard. You can also delete listings if the property is no longer available. Changes are reflected immediately.',
    category: 'Properties',
    keywords: ['edit', 'update', 'change', 'modify', 'delete']
  },

  // Agent Questions
  {
    question: ['How to become agent?', 'Agent requirements', 'Become verified agent'],
    answer: 'You need a valid Real Estate Agent License (REA license) and a government-issued ID (National ID, Passport, Driver\'s License, or Voter\'s Card). You can also submit professional credentials. All documents are reviewed by our admin team.',
    category: 'Agents',
    keywords: ['become', 'agent', 'requirements', 'how to', 'join']
  },
  {
    question: ['Agent benefits?', 'Why become agent?', 'Agent advantages'],
    answer: 'Verified agents get a verified badge, higher search ranking, access to CRM, analytics dashboard, ability to list premium properties, and increased trust from potential clients. You also get priority in search results.',
    category: 'Agents',
    keywords: ['benefits', 'advantages', 'why', 'perks', 'features']
  },

  // Buyer Questions
  {
    question: ['How to contact owner?', 'Contact property owner', 'Send message'],
    answer: 'Click "Contact Owner" or "Send Message" on any property page. You\'ll need to sign up (free) to send messages. Your inquiry will be sent directly to the property owner or agent, and if they\'re an agent, it automatically becomes a lead in their CRM.',
    category: 'Buyers',
    keywords: ['contact', 'message', 'owner', 'agent', 'inquiry']
  },
  {
    question: ['Are properties real?', 'Fake listings?', 'Property verification'],
    answer: 'Yes! We verify all properties before they go live. Our verification process checks property ownership, authenticity, and prevents fake listings. All properties have a verification status badge.',
    category: 'Buyers',
    keywords: ['real', 'fake', 'verified', 'authentic', 'scam']
  },
  {
    question: ['Can I save properties?', 'Favorites', 'Save for later'],
    answer: 'Yes! Click the heart icon on any property to add it to your favorites. You can view all your saved properties in the Favorites section. This feature is free for all users.',
    category: 'Buyers',
    keywords: ['save', 'favorite', 'favourites', 'bookmark', 'heart']
  },

  // Platform Questions
  {
    question: ['Is it free?', 'Free to use?', 'Cost to browse'],
    answer: 'Yes! Browsing properties, creating accounts, and basic features are completely free. Premium features like unlimited listings, featured placement, and priority verification are optional paid upgrades.',
    category: 'Platform',
    keywords: ['free', 'cost', 'price', 'browse', 'use']
  },
  {
    question: ['Is my data secure?', 'Data security', 'Privacy'],
    answer: 'Absolutely! We use industry-standard encryption, secure authentication, and follow best practices for data protection. Your personal information and payment details are never shared with third parties.',
    category: 'Platform',
    keywords: ['secure', 'security', 'privacy', 'data', 'safe', 'protection']
  },
  {
    question: ['Does it work on mobile?', 'Mobile app', 'Phone support'],
    answer: 'Yes! Our platform is fully responsive and works perfectly on mobile phones, tablets, and desktops. You can browse, list properties, manage leads, and use all features on any device.',
    category: 'Platform',
    keywords: ['mobile', 'phone', 'app', 'tablet', 'responsive']
  },
  {
    question: ['What makes you different?', 'Why choose you?', 'Unique features'],
    answer: 'We\'re the only platform with 100% verification, CRM for agents, support for shortlets/Airbnb, Nigerian Naira pricing, and no scams. We\'re built specifically for the Nigerian market with local support and features.',
    category: 'Platform',
    keywords: ['different', 'unique', 'why', 'special', 'better']
  },
  {
    question: ['How to report?', 'Report suspicious', 'Report fake listing'],
    answer: 'Use the "Report" button on any property or user profile. Our admin team reviews all reports within 24 hours. You can also contact support directly at support@housedirectng.com or call +234 7061350647.',
    category: 'Platform',
    keywords: ['report', 'suspicious', 'fake', 'scam', 'complaint']
  },
  {
    question: ['Can I change account type?', 'Switch account', 'Change role'],
    answer: 'Yes, but you\'ll need to contact support to change your account type (buyer to seller/agent, etc.). Some changes may require additional verification. Contact us at support@housedirectng.com for assistance.',
    category: 'Platform',
    keywords: ['change', 'switch', 'account type', 'role', 'convert']
  },
  {
    question: ['Contact support', 'Customer service', 'Help'],
    answer: 'You can contact us via email at support@housedirectng.com or call +234 7061350647. Our support team is available to help with any questions or issues you may have.',
    category: 'Platform',
    keywords: ['contact', 'support', 'help', 'customer service', 'email', 'phone']
  },
  {
    question: ['What is House Direct NG?', 'About platform', 'What is this'],
    answer: 'House Direct NG is Nigeria\'s most trusted real estate platform, connecting buyers, sellers, and agents. We provide 100% verified properties, CRM for agents, support for all property types including shortlets and Airbnb, and secure transactions in Nigerian Naira.',
    category: 'Platform',
    keywords: ['what is', 'about', 'platform', 'house direct', 'who are you']
  },
];

// Helper function to find the best answer
export function findAnswer(userQuestion: string): string {
  const question = userQuestion.toLowerCase().trim();
  
  // Direct question match
  for (const entry of knowledgeBase) {
    for (const q of entry.question) {
      if (question === q.toLowerCase()) {
        return entry.answer;
      }
    }
  }
  
  // Keyword matching with scoring
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;
  
  for (const entry of knowledgeBase) {
    let score = 0;
    const questionWords = question.split(/\s+/);
    
    // Check keywords
    for (const keyword of entry.keywords) {
      if (question.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    
    // Check question variations
    for (const q of entry.question) {
      const qWords = q.toLowerCase().split(/\s+/);
      for (const qWord of qWords) {
        if (questionWords.includes(qWord) && qWord.length > 3) {
          score += 1;
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  
  // If we have a good match, return it
  if (bestMatch && bestScore >= 2) {
    return bestMatch.answer;
  }
  
  // Default response
  return 'I\'m here to help! Could you please rephrase your question? You can ask me about CRM features, verification, pricing, property listings, or any other platform features. For specific support, contact us at support@housedirectng.com or call +234 7061350647.';
}

