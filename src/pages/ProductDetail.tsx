import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DATA, FinishType, SizeOption, LED_FRAME_SIZES, Product } from '../data/mockData';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { Star, ShieldCheck, Truck, Gift, Image as ImageIcon, Check } from 'lucide-react';

import frame1 from '../assets/20260918_162125.jpg.jpeg';
import frame2 from '../assets/20260918_162341.jpg.jpeg';
import frame3 from '../assets/20260918_162454.jpg.jpeg';
import frame4 from '../assets/20260918_162618.jpg (1).jpeg';
import frame5 from '../assets/20260918_162701.jpg (1).jpeg';
import frame6 from '../assets/20260918_163402.jpg.jpeg';

import frame1_5_1 from '../assets/frame_1.5_1.jpg';
import frame1_5_2 from '../assets/frame_1.5_2.jpg';
import frame1_5_3 from '../assets/frame_1.5_3.jpg';
import frame1_5_4 from '../assets/frame_1.5_4.jpg';

import trust1 from '../assets/trust_1.jpg';
import trust2 from '../assets/trust_2.jpg';
import trust3 from '../assets/trust_3.jpg';
import trust4 from '../assets/trust_4.jpg';

const frames1Inch = [
  { id: 1, img: frame1, name: 'Classic Wood' },
  { id: 2, img: frame2, name: 'Modern Black' },
  { id: 3, img: frame3, name: 'Elegant Gold' },
  { id: 4, img: frame4, name: 'Vintage Ornate' },
  { id: 5, img: frame5, name: 'Sleek White' },
  { id: 6, img: frame6, name: 'Premium Texture' },
];

const frames15Inch = [
  { id: 7, img: frame1_5_1, name: 'Premium Beading' },
  { id: 8, img: frame1_5_2, name: 'Royal Gold' },
  { id: 9, img: frame1_5_3, name: 'Classic Brown' },
  { id: 10, img: frame1_5_4, name: 'Vintage Wood' },
];

export const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const mockProduct = MOCK_DATA.products.find(p => p.id === productId);
  const [product, setProduct] = useState<Product | undefined>(mockProduct);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    api.getProductById(productId).then(data => {
      if (active && data) {
        setProduct(data);
      }
    }).catch(console.error);
    return () => { active = false; };
  }, [productId]);

  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>(product?.sizes?.[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishType | undefined>(product?.finishTypes?.[0]);
  const [quantity, setQuantity] = useState(1);
  
  const [customName, setCustomName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedFrameStyle, setSelectedFrameStyle] = useState<number | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const getFrameThickness = (sizeStr?: string) => {
    if (!sizeStr) return '1 Inch';
    // Remove all whitespace characters, non-breaking spaces
    const s = sizeStr.toLowerCase().replace(/[\s\u00A0]/g, '');
    if (s.includes('16x24') || s.includes('20x30') || s.includes('24x36') || s.includes('16×24') || s.includes('20×30') || s.includes('24×36')) {
      return '1.5 Inch';
    }
    return '1 Inch';
  };

  const currentThickness = getFrameThickness(selectedSize?.size);
  const activeFrames = currentThickness === '1.5 Inch' ? frames15Inch : frames1Inch;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 250;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoUploaded(true);
    }
  };
  
  useEffect(() => {
    if (product) {
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      if (product.finishTypes?.length) setSelectedFinish(product.finishTypes[0]);
    }
  }, [product]);

  // Reset frame selection if it doesn't match the current thickness category
  useEffect(() => {
    if (selectedFrameStyle !== null) {
      if (!activeFrames.find(f => f.id === selectedFrameStyle)) {
        setSelectedFrameStyle(null);
      }
    }
  }, [currentThickness]); // Depends only on thickness changing

  if (!product) {
    return <div className="container-custom py-20 text-center">Product not found</div>;
  }

  const getPriceForSize = (sizeOption: SizeOption, finish?: FinishType) => {
    const normalizeSize = (s: string) => s.replace(/[\s\u00A0]/g, '');
    if (finish === 'LED Lighting') {
      const ledMatch = LED_FRAME_SIZES.find(s => normalizeSize(s.size) === normalizeSize(sizeOption.size));
      if (ledMatch) return ledMatch.price;
    }
    return sizeOption.price;
  };

  const currentPrice = selectedSize ? getPriceForSize(selectedSize, selectedFinish) : product.price;

  const handleAddToCart = () => {
    const activeFrameObj = [...frames1Inch, ...frames15Inch].find(f => f.id === selectedFrameStyle);
    addToCart({
      productId: product.id,
      product,
      quantity,
      size: selectedSize,
      finishType: selectedFinish,
      personalizationDetails: {
        photoUrl: photoUploaded ? 'uploaded-temp-url' : undefined,
        customName: customName || undefined,
        customMessage: customMessage || undefined,
        frameStyle: activeFrameObj ? activeFrameObj.name : undefined,
      },
      itemPrice: currentPrice,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWhatsApp = () => {
    const activeFrameObj = [...frames1Inch, ...frames15Inch].find(f => f.id === selectedFrameStyle);
    const frameName = activeFrameObj ? activeFrameObj.name : 'None selected';
    const message = `Hello, I want to enquire/order this product.

Product: ${product.name}
Size: ${selectedSize?.size || 'N/A'}
Frame Thickness: ${currentThickness}
Finish Type: ${selectedFinish || 'N/A'}
Frame: ${frameName}
Quantity: ${quantity}
Price: ₹${currentPrice.toLocaleString('en-IN')}

Please confirm availability and order details.`;
    window.open(`https://wa.me/919398277441?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container-custom text-sm text-text-muted">
          Home / {product.category} / <span className="text-text-main">{product.name}</span>
        </div>
      </div>
      
      <div className="container-custom py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          {/* Left: Images */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 card-shadow sticky top-24">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Right: Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-text-muted">{product.reviews} Reviews</span>
            </div>
            
            <div className="mb-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-text-main">₹{currentPrice.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-lg text-text-muted line-through mb-1">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="bg-primary-light/50 border border-primary/20 rounded-xl p-4 mb-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Gift className="h-5 w-5" /> 🎁 FREE Gift Packing Included
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Truck className="h-5 w-5" /> 🚚 All Over India Delivery Available
              </div>
            </div>

            {/* Selectors */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-main mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedSize?.size === s.size 
                          ? 'border-primary bg-primary text-white font-medium' 
                          : 'border-gray-200 text-text-main hover:border-primary'
                      }`}
                    >
                      {s.size} — ₹{getPriceForSize(s, selectedFinish)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.finishTypes && product.finishTypes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-text-main mb-3">Finish Type</h3>
                <div className="flex flex-wrap gap-3">
                  {product.finishTypes.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedFinish === f 
                          ? 'border-primary bg-primary-light text-primary font-medium' 
                          : 'border-gray-200 text-text-main hover:border-primary'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Frame Style Selection */}
            <div className="mb-8 w-full">
              <div className="flex items-baseline gap-4 mb-3">
                <h3 className="text-sm font-medium text-text-main">Select Frame Style</h3>
                <span className="text-sm font-bold text-primary">{currentThickness}</span>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {activeFrames.map((frame) => (
                  <div 
                    key={frame.id}
                    onClick={() => setSelectedFrameStyle(frame.id)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
                      selectedFrameStyle === frame.id ? 'border-primary shadow-md scale-[1.02]' : 'border-gray-200 hover:border-primary/50 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img src={frame.img} alt={frame.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                    
                    {selectedFrameStyle === frame.id && (
                      <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-sm z-10">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white font-medium text-[10px] md:text-xs text-center">{frame.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalization */}
            {product.customizable && product.personalization && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
                <h3 className="font-serif font-semibold text-lg mb-4">Personalization Details</h3>
                
                {product.personalization.photoUpload && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-2">Upload Photo (JPG/PNG)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                    />
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${photoUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary bg-white'}`}
                      onClick={handlePhotoClick}
                    >
                      <ImageIcon className={`h-8 w-8 mx-auto mb-2 ${photoUploaded ? 'text-green-500' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium">{photoUploaded ? 'Photo Uploaded Successfully!' : 'Click to Upload Photo'}</p>
                    </div>
                  </div>
                )}
                
                {product.personalization.customName && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-2">Custom Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name to be printed" 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                )}
                
                {product.personalization.customMessage && (
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Custom Message</label>
                    <textarea 
                      placeholder="Enter your special message" 
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-xl h-14 md:h-16 w-full sm:w-32 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 flex justify-center text-text-muted hover:text-primary text-xl font-bold">-</button>
                <span className="font-medium text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary text-xl font-bold">+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-primary text-primary font-bold h-14 md:h-16 text-lg rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                Add to Cart
              </button>
              
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-primary text-white font-bold h-14 md:h-16 text-lg rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                Buy Now
              </button>
            </div>
            
            <button 
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] text-white font-medium h-12 rounded-xl hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 mb-8 shadow-sm"
            >
              Order / Enquire on WhatsApp
            </button>

            {/* Description */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="font-serif font-semibold text-lg mb-4">Product Description</h3>
              <p className="text-text-muted leading-relaxed mb-6">
                {product.description}
              </p>
              
              <ul className="space-y-3 text-sm text-text-muted">
                <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Premium Quality Guarantee</li>
                <li className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Secure Packaging</li>
                <li className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Free Gift Wrapping Included</li>
              </ul>
            </div>
            
            {/* Trust Before & After */}
            <div className="border-t border-gray-100 pt-8 mt-8">
              <h3 className="font-serif font-semibold text-lg mb-4 text-center">Quality You Can Trust</h3>
              <p className="text-text-muted text-sm mb-6 text-center">See the amazing transformation of our customers' photos. Before & After results.</p>
              <div className="grid grid-cols-2 gap-4">
                <img src={trust1} alt="Before & After 1" className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
                <img src={trust2} alt="Before & After 2" className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
                <img src={trust3} alt="Before & After 3" className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
                <img src={trust4} alt="Before & After 4" className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
