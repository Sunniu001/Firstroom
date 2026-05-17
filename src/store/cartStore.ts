import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NormalizedCart } from '@/types/product';

interface CartState {
  cart: NormalizedCart | null;
  cartToken: string | null;
  cartLastSyncedAt: number | null;
  isOpen: boolean;
  isLoading: boolean;
  selectedItemIds: string[];
  localItemData: Record<string, Record<string, string>>;
  
  // Actions
  setCart: (cart: NormalizedCart | null) => void;
  setCartToken: (token: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (itemIds: string[]) => void;
  clearSelection: () => void;
  setLocalItemData: (itemKey: string, data: Record<string, string>) => void;
  clearLocalItemData: (itemKey: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      cartToken: null,
      cartLastSyncedAt: null,
      isOpen: false,
      isLoading: false,
      selectedItemIds: [],
      localItemData: {},

      setCart: (cart) => set({ cart, cartLastSyncedAt: Date.now() }),
      setCartToken: (cartToken) => set({ cartToken }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsLoading: (isLoading) => set({ isLoading }),
      toggleItemSelection: (itemId) => set((state) => {
        const isSelected = state.selectedItemIds.includes(itemId);
        return {
          selectedItemIds: isSelected 
            ? state.selectedItemIds.filter(id => id !== itemId)
            : [...state.selectedItemIds, itemId]
        };
      }),
      selectAllItems: (itemIds) => set({ selectedItemIds: itemIds }),
      clearSelection: () => set({ selectedItemIds: [] }),
      setLocalItemData: (itemKey, data) => set((state) => ({
        localItemData: { ...state.localItemData, [itemKey]: data }
      })),
      clearLocalItemData: (itemKey) => set((state) => {
        const newData = { ...state.localItemData };
        delete newData[itemKey];
        return { localItemData: newData };
      }),
    }),
    {
      name: 'cart-storage',
      // Persist token, cart snapshot, selection, and local custom data for fast hydration.
      partialize: (state) => ({ 
        cartToken: state.cartToken,
        cart: state.cart,
        cartLastSyncedAt: state.cartLastSyncedAt,
        selectedItemIds: state.selectedItemIds,
        localItemData: state.localItemData
      }),
    }
  )
);
