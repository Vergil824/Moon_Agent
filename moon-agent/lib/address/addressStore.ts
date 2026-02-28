/**
 * Address Store - Zustand store for selected delivery address
 * Story 5.9: Persist selected address across page navigation
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SelectedAddressState = {
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number | null) => void;
};

/**
 * Store for the currently selected delivery address
 * Persisted to sessionStorage to maintain selection across page navigation
 */
export const useSelectedAddressStore = create<SelectedAddressState>()(
  persist(
    (set) => ({
      selectedAddressId: null,
      setSelectedAddressId: (selectedAddressId) => set({ selectedAddressId }),
    }),
    {
      name: "moon-selected-address",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

