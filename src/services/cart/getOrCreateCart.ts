import { getActiveCart } from './getActiveCart';
import { createCart } from './createCart';

export async function getOrCreateCart() {
  const cart = await getActiveCart();
  if (cart) {
    return cart;
  }
  return await createCart();
}
