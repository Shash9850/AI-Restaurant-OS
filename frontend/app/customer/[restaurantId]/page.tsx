"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AIWaiter from "@/components/ai/AIWaiter";

import api from "@/services/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  spicy_level: string;
  image_url?: string;
};

type Category = {
  category_id: number;
  category_name: string;
  items: MenuItem[];
};

export default function CustomerMenuPage() {

  const params = useParams();

  const [menu, setMenu] = useState<Category[]>([]);

  const [cart, setCart] = useState<
    {
      item: MenuItem;
      quantity: number;
    }[]
  >([]);

  const [customerName, setCustomerName] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {

    fetchMenu();

  }, []);

  const fetchMenu = async () => {

    try {

      const response = await api.get(
        `/public/restaurant/${params.restaurantId as string}/menu`
      );

      setMenu(response.data.menu);

    } catch (error) {

      console.log(error);
    }
  };

  const addToCart = (item: MenuItem) => {

    const existingItem = cart.find(
      (cartItem) =>
        cartItem.item.id === item.id
    );

    if (existingItem) {

      setCart(
        cart.map((cartItem) =>
          cartItem.item.id === item.id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + 1,
              }
            : cartItem
        )
      );

    } else {

      setCart([
        ...cart,
        {
          item,
          quantity: 1,
        },
      ]);
    }
  };


const removeFromCart = (
  itemId: number
) => {

  const existingItem = cart.find(
    (cartItem) =>
      cartItem.item.id === itemId
  );

  if (!existingItem) return;

  if (existingItem.quantity === 1) {

    setCart(
      cart.filter(
        (cartItem) =>
          cartItem.item.id !== itemId
      )
    );

  } else {

    setCart(
      cart.map((cartItem) =>
        cartItem.item.id === itemId
          ? {
              ...cartItem,
              quantity:
                cartItem.quantity - 1,
            }
          : cartItem
      )
    );
  }
};

const clearCart = () => {

  setCart([]);
};

  const getTotal = () => {

    return cart.reduce(
      (total, cartItem) =>
        total +
        cartItem.item.price *
        cartItem.quantity,
      0
    );
  };

  const placeOrder = async () => {

    try {

      await api.post(
        "/orders/",
        {
          table_id: 1,
          customer_name: customerName,
          notes,
          items: cart.map((cartItem) => ({
            menu_item_id:
              cartItem.item.id,
            quantity:
              cartItem.quantity,
          })),
        }
      );

      alert("Order placed successfully");

      setCart([]);
      setCustomerName("");
      setNotes("");

    } catch (error) {

      console.log(error);

      alert("Failed to place order");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-80">

      <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-zinc-800 px-4 py-4 z-50">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              Restaurant Menu
            </h1>

            <p className="text-zinc-400 text-sm">
              Scan • Order • Enjoy
            </p>

          </div>

          <div className="bg-white text-black px-4 py-2 rounded-full font-semibold">

            ₹{getTotal()}

          </div>

        </div>

      </div>

      <div className="p-4 space-y-10">

        {
          menu.map((category) => (

            <div key={category.category_id}>

              <h2 className="text-2xl font-bold mb-6">
                {category.category_name}
              </h2>

              <div className="space-y-4">

                {
                  category.items.map((item) => (

                    <div
                      key={item.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                    >

<div className="flex gap-4">

  {
    item.image_url ? (

      <img
        src={item.image_url}
        alt={item.name}
        className="w-28 h-28 object-cover rounded-2xl"
      />

    ) : (

      <div className="w-28 h-28 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">

        No Image

      </div>
    )
  }

  <div className="flex-1 flex items-start justify-between gap-4">

    <div>

      <h3 className="text-xl font-semibold mb-2">
        {item.name}
      </h3>

      <p className="text-zinc-400 text-sm mb-4">
        {item.description}
      </p>

      <div className="flex gap-2 text-xs">

        <span className="bg-zinc-800 px-3 py-1 rounded-full">
          {
            item.is_veg
              ? "Veg"
              : "Non-Veg"
          }
        </span>

        <span className="bg-zinc-800 px-3 py-1 rounded-full">
          {item.spicy_level}
        </span>

      </div>

    </div>

    <div className="text-right">

      <p className="text-xl font-bold mb-4">
        ₹{item.price}
      </p>

      <button
        onClick={() => addToCart(item)}
        className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
      >
        Add
      </button>

    </div>

  </div>

</div>

                    </div>

                  ))
                }
              </div>

            </div>
          ))
        }

      </div>

      {
        cart.length > 0 && (

          <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4">

            <div className="space-y-4">

              <div className="max-h-48 overflow-y-auto space-y-2">

                {
                  cart.map((cartItem) => (

                    <div
                      key={cartItem.item.id}
                      className="flex items-center justify-between bg-zinc-900 rounded-xl p-3"
                    >

                      <div>

                        <p className="font-semibold">
                          {cartItem.item.name}
                        </p>

                        <p className="text-sm text-zinc-400">
                          ₹{cartItem.item.price}
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            removeFromCart(
                              cartItem.item.id
                            )
                          }
                          className="bg-zinc-700 w-8 h-8 rounded-full"
                        >
                          -
                        </button>

                        <span>
                          {cartItem.quantity}
                        </span>

                        <button
                          onClick={() =>
                            addToCart(
                              cartItem.item
                            )
                          }
                          className="bg-white text-black w-8 h-8 rounded-full"
                        >
                          +
                        </button>

                      </div>

                    </div>
                  ))
                }

              </div>

              <input
                type="text"
                placeholder="Your Name"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800"
              />

              <input
                type="text"
                placeholder="Special instructions"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800"
              />

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-semibold">
                    {
                      cart.reduce(
                        (total, item) =>
                          total +
                          item.quantity,
                        0
                      )
                    }
                    {" "}
                    items added
                  </p>

                  <p className="text-zinc-400 text-sm">
                    Total ₹{getTotal()}
                  </p>

                </div>

                <button
                  onClick={placeOrder}
                  className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
                >
                  Place Order
                </button>

              </div>

            </div>

          </div>
        )
      }
<AIWaiter
  menu={menu}
  addToCart={addToCart}
  removeFromCart={
    removeFromCart
  }
  clearCart={clearCart}
/>
    </main>
  );
}