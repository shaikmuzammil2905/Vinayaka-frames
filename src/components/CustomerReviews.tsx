import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_REVIEWS: any[] = [];

export const CustomerReviews = () => {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getReviews().then(data => {
      if (mounted && data) {
        setReviews(data);
      }
      if (mounted) setLoading(false);
    }).catch(err => {
      console.error('Error fetching reviews:', err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded w-80 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[300px] md:min-w-[380px] bg-white rounded-2xl p-8 border border-gray-100 animate-pulse">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(j => <div key={j} className="w-5 h-5 bg-gray-200 rounded" />)}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">What Our Customers Say</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our happy customers have to say about their experience with Vinayaka Frames.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-6 md:gap-8 pb-8 snap-x hide-scrollbar px-4 -mx-4 md:px-0 md:mx-0">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="min-w-[290px] md:min-w-[380px] max-w-[420px] shrink-0 snap-start bg-white rounded-2xl p-6 md:p-8 card-shadow border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="h-10 w-10" />
              </div>

              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>

              {/* Review text - FIXED: proper wrapping and multi-line support */}
              <p
                className="text-text-main text-base leading-relaxed mb-6 relative z-10"
                style={{
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: '1.6',
                  minHeight: '4.8rem',
                }}
              >
                &ldquo;{review.content}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-text-main truncate">{review.name}</h4>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
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
