import { CartList } from "./cart-list";
import { Stripe } from "stripe";

function CartPage() {
  return (
    <div className="container mx-auto">
      <h1>Checkout</h1>
      <CartList />
    </div>
  );
}
export default CartPage;
