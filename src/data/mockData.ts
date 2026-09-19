export type FinishType = 'Glitter' | 'Glossy' | 'Matte' | 'Fiber Glass / Acrylic' | 'LED Lighting';

export interface SizeOption {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  sizes?: SizeOption[];
  finishTypes?: FinishType[];
  price: number;
  originalPrice?: number;
  discount?: number;
  customizable: boolean;
  personalization?: {
    photoUpload: boolean;
    customName: boolean;
    customMessage: boolean;
  };
  stock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
}

export const FRAME_SIZES: SizeOption[] = [
  { size: '8 × 12', price: 349 },
  { size: '12 × 18', price: 549 },
  { size: '16 × 24', price: 1299 },
  { size: '20 × 30', price: 1699 },
  { size: '24 × 36', price: 2449 },
];

export const LED_FRAME_SIZES: SizeOption[] = [
  { size: '8 × 12', price: 549 },
  { size: '12 × 18', price: 999 },
  { size: '16 × 24', price: 1749 },
  { size: '20 × 30', price: 2749 },
  { size: '24 × 36', price: 3749 },
];

export const FRAME_FINISHES: FinishType[] = [
  'Glitter',
  'Glossy',
  'Matte',
  'Fiber Glass / Acrylic',
  'LED Lighting',
];

import dealImage from '../assets/deal-image.png';
import promoImage from '../assets/promo-image.png';
import category2Image from '../assets/category-2.png';
import noEditFramesImage from '../assets/no-edit-frames.png';

export const CATEGORIES = [
  { id: 'god-frames', name: 'God Frames', image: promoImage },
  { id: 'no-edit-frames', name: 'No-Edit Frames', image: noEditFramesImage },
  { id: 'birthday-frames', name: 'Birthday Frames', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'wedding-frames', name: 'Wedding Frames', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'baby-frames', name: 'Baby Frames', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'death-frames', name: 'Death Frames', image: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'collage-frames', name: 'Collage Frames', image: 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'mosaic-frames', name: 'Mosaic Frames', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'oil-painting', name: 'Oil Painting', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 'personalized-gifts', name: 'Personalized Gifts', image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
];

export const PRODUCTS: Product[] = [
  {
    id: '5c06c350-f02d-4b01-a6eb-ea65cc87e278', // Real Supabase UUID
    name: 'Personalized Couple Frame',
    category: 'Wedding Frames',
    images: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'A beautiful personalized frame to celebrate your love story. Perfect for weddings, anniversaries, or just to say "I love you". Comes with FREE gift packing.',
    rating: 4.8,
    reviews: 124,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 349, // Base price
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: true,
    },
    stock: true,
    isBestSeller: true,
    isTrending: true,
  },
  {
    id: '1c4788a4-b8d0-422c-a5e8-6d64ea4f0492', // Real Supabase UUID
    name: 'Personalized Baby Birth Frame',
    category: 'Baby Frames',
    images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Capture the precious details of your little one\'s arrival with this adorable birth details frame.',
    rating: 4.9,
    reviews: 86,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 349,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: true,
    },
    stock: true,
    isBestSeller: true,
  },
  {
    id: '25f39418-8148-49f9-9b49-f12bea38266d', // Real Supabase UUID
    name: 'LED Heart Lamp',
    category: 'Personalized Gifts',
    images: [dealImage],
    description: 'A glowing LED lamp in a beautiful heart shape. Personalize it with a special message.',
    rating: 4.7,
    reviews: 42,
    price: 899,
    originalPrice: 1299,
    discount: 30,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: false,
      customMessage: true,
    },
    stock: true,
    isBestSeller: true,
    isTrending: true,
  },
  {
    id: '907a5662-ef0a-4541-ae11-d8696cbd246f', // Real Supabase UUID
    name: 'Custom Collage Frame',
    category: 'Collage Frames',
    images: ['https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Combine up to 9 of your favorite memories in one stunning collage frame.',
    rating: 4.6,
    reviews: 58,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 349,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: false,
      customMessage: false,
    },
    stock: true,
    isNew: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Happy Anniversary Frame',
    category: 'Wedding Frames',
    images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Celebrate another wonderful year together with this elegant anniversary frame.',
    rating: 4.5,
    reviews: 31,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 349,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: true,
    },
    stock: true,
    isNew: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    name: '3D Crystal Photo Cube',
    category: 'Personalized Gifts',
    images: ['https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Your 2D photo transformed into a mesmerizing 3D laser engraving inside a premium crystal cube.',
    rating: 4.9,
    reviews: 112,
    price: 1099,
    originalPrice: 1499,
    discount: 26,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: false,
    },
    stock: true,
    isTrending: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    name: 'Wooden Photo Standee',
    category: 'Personalized Gifts',
    images: ['https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'A charming wooden photo standee to decorate your desk or mantle.',
    rating: 4.7,
    reviews: 64,
    price: 799,
    originalPrice: 999,
    discount: 20,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: false,
    },
    stock: true,
    isBestSeller: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    name: 'Birthday Special Mosaic',
    category: 'Mosaic Frames',
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Hundreds of tiny pictures coming together to form one main image. A truly magical gift.',
    rating: 4.8,
    reviews: 95,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 349,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: true,
    },
    stock: true,
    isBestSeller: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000009',
    name: 'Customized Men\'s Wallet',
    category: 'Personalized Gifts',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Premium vegan leather wallet customized with a name and a charming metallic charm.',
    rating: 4.6,
    reviews: 210,
    price: 699,
    originalPrice: 899,
    discount: 22,
    customizable: true,
    personalization: {
      photoUpload: false,
      customName: true,
      customMessage: false,
    },
    stock: true,
    isTrending: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000010',
    name: 'Divine God Frame',
    category: 'God Frames',
    images: ['https://images.unsplash.com/photo-1574843940344-935cb1017b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Beautifully crafted frame for deities with elegant golden borders.',
    rating: 4.8,
    reviews: 45,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 499,
    customizable: false,
    stock: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000011',
    name: 'Classic No-Edit Frame',
    category: 'No-Edit Frames',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'A classic frame ready to showcase your standard sized photos instantly.',
    rating: 4.5,
    reviews: 32,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 299,
    customizable: false,
    stock: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    name: 'Birthday Memory Frame',
    category: 'Birthday Frames',
    images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Capture the joy of their special day with this vibrant birthday frame.',
    rating: 4.7,
    reviews: 89,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 349,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: true,
    },
    stock: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000013',
    name: 'In Loving Memory Frame',
    category: 'Death Frames',
    images: ['https://images.unsplash.com/photo-1478147427282-58a87a120781?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'A dignified and elegant frame to honor and remember your loved ones.',
    rating: 4.9,
    reviews: 120,
    sizes: FRAME_SIZES,
    finishTypes: FRAME_FINISHES,
    price: 599,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: true,
      customMessage: true,
    },
    stock: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000014',
    name: 'Hand-painted Oil Portrait',
    category: 'Oil Painting',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    description: 'Turn your photo into a masterpiece with a hand-painted oil portrait.',
    rating: 5.0,
    reviews: 15,
    price: 2499,
    customizable: true,
    personalization: {
      photoUpload: true,
      customName: false,
      customMessage: false,
    },
    stock: true,
  }
];

export const MOCK_DATA = {
  products: PRODUCTS,
  categories: CATEGORIES,
};
