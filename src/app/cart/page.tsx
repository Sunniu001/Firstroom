import React from 'react';
import { CartPage } from '@/components/CartPage/CartPage';

export const metadata = {
  title: 'Cart - FirstRoom',
  description: 'Your selected luxury items.',
};

export default function CartRoute() {
  return <CartPage />;
}
