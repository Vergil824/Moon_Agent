/**
 * Chat message types
 * Aligned with moon-agent store Message type
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Full content for typewriter effect (streaming messages) */
  fullContent?: string;
  timestamp: number;
}

/**
 * Chat state payload for state-driven components
 */
export interface ChatStatePayload {
  step?: string;
  products?: Product[];
  [key: string]: unknown;
}

/**
 * Product type for recommendations
 */
export interface Product {
  sku_id?: number;
  spu_id?: number;
  product_name: string;
  price: number;
  matching?: number;
  image_url?: string;
  description?: string;
  style?: string;
  features?: string[];
  size?: string;
}

/**
 * Props type for state-driven components
 */
export interface StateComponentProps {
  onSelect: (value: string) => void;
  payload?: ChatStatePayload;
}

/**
 * Measurement data collected from MeasureGuide
 */
export interface MeasurementData {
  lowerBust: number;
  upperBust: number;
  bustDifference: number;
}

/**
 * Auxiliary data collected from AuxiliaryInput
 */
export interface AuxiliaryData {
  height: number;
  weight: number;
  waist: number;
}
