import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  role: 'buyer' | 'seller' | 'agent';
  rating: number;
  text: string;
  propertyType?: string;
  outcome?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Adebayo Okafor',
    location: 'Lagos',
    role: 'seller',
    rating: 5,
    text: 'Sold my property in 2 weeks! The verification process gave buyers confidence. No more dealing with time wasters or fake inquiries. The platform connected me with serious buyers only.',
    propertyType: '3-bedroom apartment',
    outcome: 'Sold in 2 weeks'
  },
  {
    id: '2',
    name: 'Chioma Kalu',
    location: 'Abuja',
    role: 'buyer',
    rating: 5,
    text: 'Finally found my dream home! The verified agents made all the difference. No scams, just real properties with real photos. The ID verification gave me peace of mind.',
    propertyType: '4-bedroom house',
    outcome: 'Found perfect home'
  },
  {
    id: '3',
    name: 'Ibrahim Emeka',
    location: 'Port Harcourt',
    role: 'agent',
    rating: 5,
    text: 'Being verified helped me stand out from unverified agents. I get 3x more inquiries than before. Clients trust verified agents more and I close deals faster.',
    propertyType: 'Commercial properties',
    outcome: '3x more inquiries'
  },
  {
    id: '4',
    name: 'Funke Adebayo',
    location: 'Ibadan',
    role: 'seller',
    rating: 5,
    text: 'Listed my shortlet property and got bookings within days. The platform is so much better than Facebook marketplace - real inquiries, verified guests, no scams.',
    propertyType: 'Shortlet apartment',
    outcome: 'Bookings within days'
  },
  {
    id: '5',
    name: 'David Okonkwo',
    location: 'Enugu',
    role: 'buyer',
    rating: 5,
    text: 'As a first-time buyer, I was worried about scams. But the verification badges and ID checks gave me confidence. Found a great property through a verified agent.',
    propertyType: '2-bedroom apartment',
    outcome: 'Successful first purchase'
  },
  {
    id: '6',
    name: 'Amina Bello',
    location: 'Kano',
    role: 'agent',
    rating: 5,
    text: 'The tiered verification system is brilliant. As a Premium Agent, I get priority placement and more visibility. My client base has grown significantly since joining.',
    propertyType: 'Residential & Commercial',
    outcome: 'Significant client growth'
  },
  {
    id: '7',
    name: 'Tunde Williams',
    location: 'Lagos',
    role: 'seller',
    rating: 5,
    text: 'After getting scammed on Facebook, I was hesitant. But this platform verified everything - my property, the buyers, even the agents. Finally sold safely.',
    propertyType: 'Land',
    outcome: 'Safe transaction'
  },
  {
    id: '8',
    name: 'Blessing Okafor',
    location: 'Abuja',
    role: 'buyer',
    rating: 5,
    text: 'The comparison page helped me understand why verified agents matter. I only work with verified agents now - it saves time and prevents scams.',
    propertyType: 'Office space',
    outcome: 'Found perfect office'
  }
];

export default function TestimonialsPage() {
  const buyerTestimonials = testimonials.filter(t => t.role === 'buyer');
  const sellerTestimonials = testimonials.filter(t => t.role === 'seller');
  const agentTestimonials = testimonials.filter(t => t.role === 'agent');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Success Stories</h1>
            <p className="text-xl text-primary-100">
              Real Nigerians sharing their real estate success stories
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12 text-center">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">{testimonials.length}+</div>
                <div className="text-gray-600">Success Stories</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">5.0</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                <div className="text-gray-600">Verified Transactions</div>
              </div>
            </div>
          </div>

          {/* Buyer Testimonials */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Buyer Success Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {buyerTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.location} • Buyer</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3 italic">"{testimonial.text}"</p>
                  {testimonial.outcome && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ {testimonial.outcome}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Seller Testimonials */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Seller Success Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {sellerTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.location} • Seller</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3 italic">"{testimonial.text}"</p>
                  {testimonial.outcome && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ {testimonial.outcome}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Agent Testimonials */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Agent Success Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {agentTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.location} • Agent</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3 italic">"{testimonial.text}"</p>
                  {testimonial.outcome && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ {testimonial.outcome}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Success Story?</h2>
            <p className="text-xl text-primary-100 mb-6">
              Join thousands of Nigerians buying, selling, and renting safely
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-primary-700 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all shadow-xl"
              >
                Create Free Account
              </Link>
              <Link
                to="/properties"
                className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-400 transition-all border-2 border-white"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

