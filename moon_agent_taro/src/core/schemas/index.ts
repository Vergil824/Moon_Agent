/**
 * @core/schemas - Zod schema definitions
 * 
 * This module contains shared validation schemas using Zod.
 * Schemas are reused across H5, WeChat Mini Program, and Taro RN.
 */

// Form validation schemas
export * from './form'

// Measurement data schema type
export type MeasurementData = {
  lowerBust: number;
  upperBust: number;
  bustDifference: number;
};

// Auxiliary body data schema type
export type AuxiliaryData = {
  height: number;
  weight: number;
  waist: number;
};

// Chest type options
export type ChestType = 'round' | 'spindle' | 'hemisphere';

// Pain point options
export type PainPointId = 'wire_poking' | 'cup_slipping' | 'quad_boob' | 'gaping_cup' | 'strap_issues';

// Product type
export type Product = {
  sku_id?: number;
  spu_id?: number;
  product_name: string;
  price: number;
  matching: number;
  image_url: string;
  size: string;
  description?: string;
  style?: string;
  features?: string[];
};

// User profile type
export type UserProfile = {
  id: number;
  nickname: string;
  avatar?: string;
  mobile?: string;
};

