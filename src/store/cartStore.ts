import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NormalizedCart } from '@/types/product';

interface CartState {
  cart: NormalizedCart | null;
  cartToken: string | null;
  isOpen: boolean;
  isLoading: boolean;
  selectedItemIds: string[];
  
  // Actions
  setCart: (cart: NormalizedCart | null) => void;
  setCartToken: (token: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (itemIds: string[]) => void;
  clearSelection: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      cartToken: null,
      isOpen: false,
      isLoading: false,
      selectedItemIds: [],

      setCart: (cart) => set({ cart }),
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
    }),
    {
      name: 'cart-storage',
      // We persist both the token and the selected items
      partialize: (state) => ({ 
        cartToken: state.cartToken,
        selectedItemIds: state.selectedItemIds 
      }),
    }
  )
);
