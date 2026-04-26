import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  currencyCode: string;
  availableForSale: boolean;
}

export interface WishlistList {
  id: string;
  name: string;
  items: WishlistItem[];
}

interface WishlistState {
  lists: WishlistList[];

  // List management
  createList: (name: string) => string; // returns new list id
  deleteList: (listId: string) => void;

  // Item management
  addItemToList: (listId: string, item: WishlistItem) => void;
  removeItemFromList: (listId: string, productId: string) => void;

  // Queries
  isInAnyList: (productId: string) => boolean;
  getListsContaining: (productId: string) => string[]; // list ids
}

const DEFAULT_LIST_ID = 'default';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      lists: [{ id: DEFAULT_LIST_ID, name: 'Default Wishlist', items: [] }],

      createList: (name) => {
        const id = `list_${Date.now()}`;
        set((state) => ({
          lists: [...state.lists, { id, name, items: [] }],
        }));
        return id;
      },

      deleteList: (listId) => set((state) => ({
        lists: state.lists.filter(l => l.id !== listId),
      })),

      addItemToList: (listId, item) => set((state) => ({
        lists: state.lists.map(list =>
          list.id === listId
            ? list.items.find(i => i.productId === item.productId)
              ? list // already in list, no-op
              : { ...list, items: [...list.items, item] }
            : list
        ),
      })),

      removeItemFromList: (listId, productId) => set((state) => ({
        lists: state.lists.map(list =>
          list.id === listId
            ? { ...list, items: list.items.filter(i => i.productId !== productId) }
            : list
        ),
      })),

      isInAnyList: (productId) =>
        get().lists.some(l => l.items.some(i => i.productId === productId)),

      getListsContaining: (productId) =>
        get().lists.filter(l => l.items.some(i => i.productId === productId)).map(l => l.id),
    }),
    { name: 'wishlist-storage' }
  )
);
