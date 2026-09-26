import React, { useState, useEffect, useRef } from 'react';
import { Play, X, Volume2, VolumeX } from 'lucide-react';
import { api } from '../lib/api';

interface Reel {
  id: string;
  title?: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  productName?: string;
}

const ReelCard = ({ reel }: { reel: Reel }) => {
  const [showModal, setShowModal] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    if (videoRef.current) videoRef.current.pause();
  };

  useEffect(() => {
    if (showModal && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showModal]);

  return (
    <>
      {/* Reel Card - vertical 9:16 style */}
      <div
        className="min-w-[160px] md:min-w-[200px] max-w-[200px] shrink-0 snap-start relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{ aspectRatio: '9/16' }}
        onClick={handleOpen}
      >
        {reel.thumbnailUrl ? (
          <img
            src={reel.thumbnailUrl}
            alt={reel.title || 'Reel'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
            <Play className="h-12 w-12 text-white/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play className="h-5 w-5 text-primary fill-primary ml-0.5" />
          </div>
        </div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {reel.title && (
            <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{reel.title}</p>
          )}
        </div>
      </div>

      {/* Full video modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={handleClose}>
          <div className="relative" style={{ maxHeight: '90vh', maxWidth: '400px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div>
                {reel.title && <p className="text-white font-semibold">{reel.title}</p>}
                {reel.description && <p className="text-white/70 text-sm">{reel.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
              <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                controls
                playsInline
                muted={muted}
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ReelsSection = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getReels().then((data) => {
      if (mounted && data) setReels(data);
      if (mounted) setLoading(false);
    }).catch((err) => {
      console.error('Error fetching reels:', err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-72 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[160px] w-[160px] animate-pulse rounded-2xl bg-gray-200" style={{ aspectRatio: '9/16' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden relative">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Latest Reels
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-3">
            Short Moments, Big Memories
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto">
            Peek into our world — real customers, beautiful frames, precious moments.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar px-4 -mx-4 md:px-0 md:mx-0 md:justify-center">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  );
};
