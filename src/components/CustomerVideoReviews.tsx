import React, { useState, useEffect, useRef } from 'react';
import { Star, Play, X } from 'lucide-react';
import { api } from '../lib/api';

interface VideoReview {
  id: string;
  customerName: string;
  reviewText: string;
  rating: number;
  videoUrl: string;
  thumbnailUrl?: string;
  productName?: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

const VideoReviewCard = ({ review }: { review: VideoReview }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    if (showModal && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showModal]);

  return (
    <>
      <div className="min-w-[280px] md:min-w-[320px] max-w-[320px] shrink-0 snap-start bg-white rounded-2xl overflow-hidden card-shadow border border-gray-100 group hover:-translate-y-1 transition-transform duration-300">
        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gray-900 cursor-pointer overflow-hidden" onClick={handlePlay}>
          {review.thumbnailUrl ? (
            <img
              src={review.thumbnailUrl}
              alt={`${review.customerName}'s review`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Play className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Play className="h-6 w-6 text-primary fill-primary ml-1" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {review.customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-main text-sm truncate">{review.customerName}</p>
              {review.productName && (
                <p className="text-xs text-text-muted truncate">{review.productName}</p>
              )}
            </div>
          </div>
          <StarRating rating={review.rating} />
          {review.reviewText && (
            <p className="text-text-muted text-sm leading-relaxed mt-2 line-clamp-3" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
              "{review.reviewText}"
            </p>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-7 w-7" />
            </button>
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
              <video
                ref={videoRef}
                src={review.videoUrl}
                poster={review.thumbnailUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video"
              />
            </div>
            <div className="bg-white rounded-2xl mt-3 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {review.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-text-main">{review.customerName}</p>
                  <StarRating rating={review.rating} />
                </div>
              </div>
              {review.reviewText && (
                <p className="text-text-muted text-sm leading-relaxed mt-3" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                  "{review.reviewText}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const CustomerVideoReviews = () => {
  const [reviews, setReviews] = useState<VideoReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getVideoReviews().then((data) => {
      if (mounted && data) setReviews(data);
      if (mounted) setLoading(false);
    }).catch((err) => {
      console.error('Error fetching video reviews:', err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[280px] bg-white rounded-2xl animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
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
    <section className="py-12 md:py-16 bg-gray-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Customer Videos
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-3">
            See What Customers Say
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto">
            Real customers, real frames, real happiness. Watch their stories.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-5 pb-4 snap-x hide-scrollbar px-4 -mx-4 md:px-0 md:mx-0">
          {reviews.map((review) => (
            <VideoReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};
