import type { ComponentType } from 'react';
import { WelcomeOptions } from './WelcomeOptions';
import { MeasureGuide } from './MeasureGuide';
import { AuxiliaryInput } from './AuxiliaryInput';
import { ShapeSelection } from './ShapeSelection';
import { PainPointGrid } from './PainPointGrid';
import { LoadingAnalysis } from './LoadingAnalysis';
import { ProductRecommendation } from './ProductRecommendation';
import type { StateComponentProps, ChatStatePayload } from './types';

/**
 * Map of step names to their corresponding components
 * Aligned with moon-agent/components/chat/StateComponents.tsx
 *
 * Step mappings:
 * - welcome → WelcomeOptions
 * - size_input → MeasureGuide
 * - body_info → AuxiliaryInput
 * - shape_choice → ShapeSelection
 * - pain_points → PainPointGrid
 * - summary → LoadingAnalysis
 * - recommendation / recommendations → ProductRecommendation
 */
export const StateComponentMap: Record<
  string,
  ComponentType<StateComponentProps>
> = {
  welcome: WelcomeOptions,
  size_input: MeasureGuide,
  body_info: AuxiliaryInput,
  shape_choice: ShapeSelection,
  pain_points: PainPointGrid,
  summary: LoadingAnalysis,
  recommendation: ProductRecommendation,
  recommendations: ProductRecommendation,
  // Defensive aliases: some backends may send component-like step names
  ProductRecommendation: ProductRecommendation,
};

/**
 * Get the component to render based on the current state
 * Returns null if no component matches the state
 */
export function getStateComponent(
  state: ChatStatePayload | null
): ComponentType<StateComponentProps> | null {
  if (!state || typeof state.step !== 'string') {
    return null;
  }

  return StateComponentMap[state.step] || null;
}
