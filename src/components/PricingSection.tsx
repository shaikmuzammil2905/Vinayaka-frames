import React, { useState, useRef } from 'react';
import { Check, Upload } from 'lucide-react';

import frame1 from '../assets/20260918_162125.jpg.jpeg';
import frame2 from '../assets/20260918_162341.jpg.jpeg';
import frame3 from '../assets/20260918_162454.jpg.jpeg';
import frame4 from '../assets/20260918_162618.jpg (1).jpeg';
import frame5 from '../assets/20260918_162701.jpg (1).jpeg';
import frame6 from '../assets/20260918_163402.jpg.jpeg';

export const PricingSection = () => {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const pricingTiers = [
    { size: '8×12', price: 549, mp: 1098 },
    { size: '12×18', price: 999, mp: 1998 },
    { size: '16×24', price: 1749, mp: 3498 },
    { size: '20×30', price: 2749, mp: 5498 },
    { size: '24×36', price: 3749, mp: 7498 },
  ];

  const frames = [
    { id: 1, img: frame1, name: 'Classic Wood' },
    { id: 2, img: frame2, name: 'Modern Black' },
    { id: 3, img: frame3, name: 'Elegant Gold' },
    { id: 4, img: frame4, name: 'Vintage Ornate' },
    { id: 5, img: frame5, name: 'Sleek White' },
    { id: 6, img: frame6, name: 'Premium Texture' },
  ];

  const handleOrder = () => {
    if (selectedFrame === null) {
      alert('Please select a frame style first!');
      return;
    }
    const frame = frames.find(f => f.id === selectedFrame);
    const message = `Hello Vinayak Frames! I would like to order a Lightning Frame.\nSelected Style: ${frame?.name}\nPhoto Uploaded: ${selectedImage ? 'Yes (' + selectedImage.name + ')' : 'No'}\nPlease let me know the process to order.`;
    window.open(`https://wa.me/919398277441?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="led-lighting" className="py-16 bg-gradient-to-b from-gray-50 to-white scroll-mt-24">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-block bg-red-100 text-red-600 font-bold px-4 py-1.5 rounded-full mb-4 animate-pulse">
            FLAT 50% DISCOUNT 🔥
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">LED Lightning Frames</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Illuminate your precious memories with our premium LED frames. Perfect for gifts and home decor. Choose your favorite style below!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Pricing Box */}
          <div className="w-full lg:w-1/3 bg-white rounded-3xl card-shadow border border-primary/20 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white font-bold px-6 py-2 rounded-bl-2xl">
              Best Prices
            </div>
            <h3 className="text-2xl font-serif font-bold text-text-main mb-8 mt-4">Pricing Table</h3>
            
            <div className="space-y-4">
              {pricingTiers.map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="font-bold text-lg text-text-main">{tier.size}</div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">₹{tier.price}</div>
                    <div className="text-sm text-gray-400 line-through">MP - ₹{tier.mp}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleOrder}
              className="w-full mt-8 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Order on WhatsApp
            </button>
          </div>

          {/* Frame Selection */}
          <div className="w-full lg:w-2/3">
            <h3 className="text-2xl font-serif font-bold text-text-main mb-6">Select Your Frame Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {frames.map((frame) => (
                <div 
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-300 group ${
                    selectedFrame === frame.id ? 'border-primary shadow-lg scale-[1.02]' : 'border-transparent hover:border-primary/50 bg-gray-100'
                  }`}
                >
                  <div className="aspect-[4/5] relative">
                    <img src={frame.img} alt={frame.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  
                  {selectedFrame === frame.id && (
                    <div className="absolute top-3 right-3 bg-primary text-white p-1.5 rounded-full shadow-md z-10">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white font-medium text-center">{frame.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Photo Upload Section */}
            <h3 className="text-2xl font-serif font-bold text-text-main mb-6 mt-10">Upload Your Photo (Optional)</h3>
            <div 
              className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center border-primary/30 hover:border-primary/60" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <Upload className="h-10 w-10 text-primary mb-4" />
              {selectedImage ? (
                <div className="text-text-main font-medium flex items-center gap-2">
                  <span className="text-green-600"><Check className="h-5 w-5" /></span>
                  Selected: {selectedImage.name}
                </div>
              ) : (
                <>
                  <p className="text-text-main font-medium mb-1">Click to select the picture for your frame</p>
                  <p className="text-sm text-text-muted">JPG, PNG or WEBP (You can also send it directly on WhatsApp)</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
