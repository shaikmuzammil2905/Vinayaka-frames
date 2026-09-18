import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_REVIEWS = [
  {
    id: '1',
    name: "Priya Sharma",
    role: "Verified Buyer",
    content: "The quality of the frames is absolutely stunning. I ordered a personalized collage frame for my anniversary and it exceeded all expectations. The packaging was also very secure.",
    rating: 5,
    date: "2 days ago"
  },
  {
    id: '2',
    name: "Rahul Verma",
    role: "Verified Buyer",
    content: "Amazing LED frames! I bought one for my best friend's birthday. The light effect is beautiful and it makes for a perfect night lamp. Highly recommend Vinayak Frames.",
    rating: 5,
    date: "1 week ago"
  },
  {
    id: '3',
    name: "Anjali Desai",
    role: "Verified Buyer",
    content: "Very professional service and quick delivery. The finish on the wooden frames gives a very premium look to my living room wall. Will definitely order more.",
    rating: 5,
    date: "2 weeks ago"
  }
];

export const CustomerReviews = () => {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);

  useEffect(() => {
    let mounted = true;
    api.getReviews().then(data => {
      if (mounted && data && data.length > 0) {
        setReviews(data);
      }
    }).catch(err => {
      console.error('Error fetching reviews:', err);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">What Our Customers Say</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our happy customers have to say about their experience with Vinayak Frames.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-8 card-shadow border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="h-12 w-12" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-text-main text-lg leading-relaxed mb-8 relative z-10">
                "{review.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-text-main">{review.name}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-medium">{review.role}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
