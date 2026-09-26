import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FinishType, SizeOption, LED_FRAME_SIZES, Product } from '../data/mockData';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { Star, ShieldCheck, Truck, Gift, Image as ImageIcon, Check, Upload } from 'lucide-react';

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
  
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [personalizationFields, setPersonalizationFields] = useState<any[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [dynamicFileInputs, setDynamicFileInputs] = useState<Record<string, File[]>>({});

  useEffect(() => {
    if (!productId) return;
    let active = true;
    api.getProductById(productId).then(data => {
      if (active && data) {
        setProduct(data);
        // Fetch dynamic personalization fields
        api.getPersonalizationFields(data.id).then(fields => {
          if (active) setPersonalizationFields(fields);
        }).catch(console.error);
      }
    }).catch(console.error);
    return () => { active = false; };
  }, [productId]);

  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>(product?.sizes?.[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishType | undefined>(product?.finishTypes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  
  const [customName, setCustomName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedFrameStyle, setSelectedFrameStyle] = useState<number | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && product?.images && product.images.length > 1) {
      setMainImageIndex(prev => (prev + 1) % product.images!.length);
    }
    if (isRightSwipe && product?.images && product.images.length > 1) {
      setMainImageIndex(prev => (prev - 1 + product.images!.length) % product.images!.length);
    }
  }
  
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

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = (selectedSize ? getPriceForSize(selectedSize, selectedFinish) : product.price) + (selectedVariant?.priceAdjustment || 0);

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
        variantId: selectedVariantId || undefined,
        variantName: selectedVariant?.name,
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
    <div className="bg-white min-h-screen pb-28">
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container-custom text-sm text-text-muted">
          Home / {product.category} / <span className="text-text-main">{product.name}</span>
        </div>
      </div>
      
      <div className="container-custom py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 relative">
          {/* Left: Images */}
          <div className="w-full md:w-1/2 flex flex-col md:flex-row gap-4 md:sticky md:top-24 self-start z-10 bg-white">
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar order-2 md:order-1 w-full md:w-24 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div 
              className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 card-shadow flex-grow order-1 md:order-2 w-full touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndHandler}
            >
              <img src={product.images[mainImageIndex] || product.images[0]} alt={product.name} className="w-full h-full object-contain" />
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

            {/* Design Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-main mb-3">Select Design</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                        selectedVariantId === v.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 hover:border-primary/30 bg-white'
                      }`}
                    >
                      {v.imageUrl && (
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-1">
                          <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-main text-center leading-tight">
                        {v.name}
                      </span>
                      {v.priceAdjustment > 0 && (
                        <span className="text-xs text-primary font-medium">
                          +₹{v.priceAdjustment}
                        </span>
                      )}
                      {selectedVariantId === v.id && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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

            {/* Dynamic Personalization Fields (from DB) */}
            {personalizationFields.length > 0 && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
                <h3 className="font-serif font-semibold text-lg mb-5">Personalization Details</h3>
                <div className="space-y-5">
                  {personalizationFields.map((field) => {
                    const fieldId = `pf-${field.id}`;
                    const isImageField = field.fieldType === 'single_image' || field.fieldType === 'multiple_image';
                    const currentFiles = dynamicFileInputs[field.id] || [];
                    
                    return (
                      <div key={field.id}>
                        <label htmlFor={fieldId} className="block text-sm font-medium text-text-main mb-1.5">
                          {field.fieldLabel}
                          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {field.fieldType === 'text' && (
                          <input
                            id={fieldId}
                            type="text"
                            placeholder={field.placeholder || ''}
                            value={dynamicFieldValues[field.id] || ''}
                            onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            required={field.isRequired}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        )}
                        
                        {field.fieldType === 'textarea' && (
                          <textarea
                            id={fieldId}
                            placeholder={field.placeholder || ''}
                            value={dynamicFieldValues[field.id] || ''}
                            onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            rows={3}
                            required={field.isRequired}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          />
                        )}

                        {field.fieldType === 'date' && (
                          <input
                            id={fieldId}
                            type="date"
                            value={dynamicFieldValues[field.id] || ''}
                            onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            required={field.isRequired}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        )}
                        
                        {field.fieldType === 'phone' && (
                          <input
                            id={fieldId}
                            type="tel"
                            placeholder={field.placeholder || '+91 XXXXX XXXXX'}
                            value={dynamicFieldValues[field.id] || ''}
                            onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            required={field.isRequired}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        )}
                        
                        {field.fieldType === 'number' && (
                          <input
                            id={fieldId}
                            type="number"
                            placeholder={field.placeholder || ''}
                            value={dynamicFieldValues[field.id] || ''}
                            onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            required={field.isRequired}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        )}

                        {field.fieldType === 'dropdown' && (
                          <select
                            id={fieldId}
                            value={dynamicFieldValues[field.id] || ''}
                            onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            required={field.isRequired}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                          >
                            <option value="">{field.placeholder || '-- Select option --'}</option>
                            {(field.options || []).map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {field.fieldType === 'checkbox' && (
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              id={fieldId}
                              type="checkbox"
                              checked={!!dynamicFieldValues[field.id]}
                              onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.id]: e.target.checked }))}
                              className="w-5 h-5 rounded text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-text-muted">{field.placeholder || 'Yes, I confirm'}</span>
                          </label>
                        )}
                        
                        {(field.fieldType === 'single_image' || field.fieldType === 'multiple_image') && (
                          <div>
                            <input
                              id={fieldId}
                              type="file"
                              accept="image/*"
                              multiple={field.fieldType === 'multiple_image'}
                              required={field.isRequired && currentFiles.length === 0}
                              onChange={e => {
                                const files = Array.from(e.target.files || []);
                                setDynamicFileInputs(prev => ({ ...prev, [field.id]: files }));
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={fieldId}
                              className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
                                currentFiles.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary bg-white'
                              }`}
                            >
                              <ImageIcon className={`h-8 w-8 ${currentFiles.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                              {currentFiles.length > 0 ? (
                                <div className="text-center">
                                  <p className="text-sm font-medium text-green-700">
                                    {currentFiles.length} file{currentFiles.length > 1 ? 's' : ''} selected
                                  </p>
                                  <p className="text-xs text-green-600">{currentFiles.map(f => f.name).join(', ')}</p>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-gray-600">
                                  {field.placeholder || `Click to upload ${field.fieldType === 'multiple_image' ? 'photos' : 'photo'}`}
                                </p>
                              )}
                            </label>
                          </div>
                        )}
                        
                        {field.helpText && (
                          <p className="text-xs text-text-muted mt-1">{field.helpText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fallback static personalization (when no dynamic fields configured) */}
            {personalizationFields.length === 0 && product.customizable && product.personalization && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
                <h3 className="font-serif font-semibold text-lg mb-4">Personalization Details</h3>
                
                {product.personalization.photoUpload && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-2">Upload Photo (JPG/PNG)</label>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
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
                    />
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
            
            {/* Trust Before & After removed */}

          </div>
        </div>
      </div>
    </div>
  );
};
