import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DATA, FinishType, SizeOption } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { Star, ShieldCheck, Truck, Gift, Image as ImageIcon } from 'lucide-react';

export const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = MOCK_DATA.products.find(p => p.id === productId);
  
  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>(product?.sizes?.[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishType | undefined>(product?.finishTypes?.[0]);
  const [quantity, setQuantity] = useState(1);
  
  const [customName, setCustomName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  
  useEffect(() => {
    if (product) {
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      if (product.finishTypes?.length) setSelectedFinish(product.finishTypes[0]);
    }
  }, [product]);

  if (!product) {
    return <div className="container-custom py-20 text-center">Product not found</div>;
  }

  const currentPrice = selectedSize ? selectedSize.price : product.price;

  const handleAddToCart = () => {
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
      },
      itemPrice: currentPrice,
    });
    // Optional: show a toast or feedback
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
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
                      {s.size} — ₹{s.price}
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

            {/* Personalization */}
            {product.customizable && product.personalization && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
                <h3 className="font-serif font-semibold text-lg mb-4">Personalization Details</h3>
                
                {product.personalization.photoUpload && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-main mb-2">Upload Photo (JPG/PNG)</label>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${photoUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary bg-white'}`}
                      onClick={() => setPhotoUploaded(true)}
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
              <div className="flex items-center border border-gray-300 rounded-xl h-12 w-32 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 flex justify-center text-text-muted hover:text-primary">-</button>
                <span className="font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 flex justify-center text-text-muted hover:text-primary">+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-primary text-primary font-medium h-12 rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                Add to Cart
              </button>
              
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-primary text-white font-medium h-12 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                Buy Now
              </button>
            </div>
            
            <a 
              href="https://wa.me/919398277441" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#25D366] text-white font-medium h-12 rounded-xl hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 mb-8 shadow-sm"
            >
              Order / Enquire on WhatsApp
            </a>

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
          </div>
        </div>
      </div>
    </div>
  );
};
