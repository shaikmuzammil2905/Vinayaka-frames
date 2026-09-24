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

export const PRODUCTS: Product[] = [];
export const CATEGORIES: any[] = [];
export const MOCK_DATA = {
  products: PRODUCTS,
  categories: CATEGORIES,
};
