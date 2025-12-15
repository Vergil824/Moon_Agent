import type { ComponentType } from "react";
import { WelcomeOptions } from "./WelcomeOptions";
import { MeasureGuide } from "./MeasureGuide";
import { AuxiliaryInput } from "./AuxiliaryInput";
import { ShapeSelection } from "./ShapeSelection";
import { PainPointGrid } from "./PainPointGrid";
import { ChatStatePayload } from "@/lib/store";

/**
 * Props type for state-driven components
 */
export type StateComponentProps = {
  onSelect: (value: string) => void;
};

/**
 * Map of step names to their corresponding components
 * Add new step components here as they are implemented
 */
export const StateComponentMap: Record<
  string,
  ComponentType<StateComponentProps>
> = {
  welcome: WelcomeOptions,
  size_input: MeasureGuide,
  body_info: AuxiliaryInput,
  shape_choice: ShapeSelection,
  pain_points: PainPointGrid
};

/**
 * Get the component to render based on the current state
 * Returns null if no component matches the state
 */
export function getStateComponent(
  state: ChatStatePayload | null
): ComponentType<StateComponentProps> | null {
  if (!state || typeof state.step !== "string") {
    return null;
  }

  return StateComponentMap[state.step] || null;
}

