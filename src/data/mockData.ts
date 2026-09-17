export type FinishType = 'Glitter' | 'Glossy' | 'Matte' | 'Fiber Glass / Acrylic';

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

export const FRAME_FINISHES: FinishType[] = [
  'Glitter',
  'Glossy',
  'Matte',
  'Fiber Glass / Acrylic',
];

export const CATEGORIES = [
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
    id: 'p1',
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
    id: 'p2',
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
    id: 'p3',
    name: 'LED Heart Lamp',
    category: 'Personalized Gifts',
    images: ['https://images.unsplash.com/photo-1543881478-f71694f71a93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
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
    id: 'p4',
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
    id: 'p5',
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
    id: 'p6',
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
    id: 'p7',
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
    id: 'p8',
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
    id: 'p9',
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
  }
];

export const MOCK_DATA = {
  products: PRODUCTS,
  categories: CATEGORIES,
};
