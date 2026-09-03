'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { Toast } from '../ui/Toast';

export function GlobalToast() {
  const { toastMessage, setToastMessage } = useCart();

  return (
    <Toast
      message={toastMessage}
      onDismiss={() => setToastMessage(null)}
      variant="success"
    />
  );
}
