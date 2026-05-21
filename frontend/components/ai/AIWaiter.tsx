"use client";

import { useState } from "react";

import api from "@/services/api";
import { useParams } from "next/navigation";


type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  spicy_level: string;
  image_url?: string;
};

type Props = {

removeFromCart: (
  itemId: number
) => void;

clearCart: () => void;
  menu: {
    items: MenuItem[];
  }[];

  addToCart: (
    item: MenuItem
  ) => void;
};


type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIWaiter({
  menu,
  addToCart,
  removeFromCart,
  clearCart,
}: Props) {

  const [isOpen, setIsOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        content:
          "Hello 👋 I am your AI waiter. What would you like to eat today?",
      },
    ]);

    const params = useParams();
 const sendMessage = async () => {

  if (!input.trim()) return;

  const userMessage = {
    role: "user" as const,
    content: input,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  const currentInput = input;

  setInput("");

  try {

    const response = await api.post(
      "/ai/chat",
      {
        restaurant_id:
          Number(
            params.restaurantId
          ),
        message: currentInput,
        history: messages,
      }
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          response.data.reply,
      },
    ]);

  if (
  response.data.actions
) {

  for (
    const action
    of response.data.actions
  ) {

    // ADD TO CART

    if (
      action.type ===
      "add_to_cart"
    ) {

      const itemId =
        action.item_id;

      const matchedItem =
        menu
          .flatMap(
            (category) =>
              category.items
          )
          .find(
            (item) =>
              item.id === itemId
          );

      if (matchedItem) {

        for (
          let i = 0;
          i < action.quantity;
          i++
        ) {

          addToCart(
            matchedItem
          );
        }
      }
    }

    // REMOVE ITEM

    if (
      action.type ===
      "remove_from_cart"
    ) {

      removeFromCart(
        action.item_id
      );
    }

    // CLEAR CART

    if (
      action.type ===
      "clear_cart"
    ) {

      clearCart();
    }
  }
}

  } catch (error) {

    console.log(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Sorry, I could not process your request.",
      },
    ]);
  }
};

  return (
    <>

      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className="fixed bottom-24 right-5 z-50 bg-white text-black w-16 h-16 rounded-full shadow-2xl text-2xl"
      >
        🤖
      </button>

      {
        isOpen && (

          <div className="fixed bottom-44 right-5 w-[360px] h-[550px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50">

            <div className="border-b border-zinc-800 p-5">

              <h2 className="text-xl font-bold text-white">
                AI Waiter
              </h2>

              <p className="text-zinc-400 text-sm">
                Ask for recommendations or place orders naturally
              </p>

            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">

              {
                messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`
                        max-w-[85%] p-4 rounded-2xl text-sm

                        ${
                          message.role === "assistant"
                            ? "bg-zinc-900 text-white"
                            : "bg-white text-black ml-auto"
                        }
                      `}
                    >
                      {message.content}
                    </div>
                  )
                )
              }

            </div>

            <div className="border-t border-zinc-800 p-4 bg-zinc-950">

              <div className="flex gap-2">

                <input
                  type="text"
                  placeholder="Ask AI waiter..."
                  value={input}
                  onChange={(e) =>
                    setInput(
                      e.target.value
                    )
                  }
                  className="flex-1 bg-zinc-900 text-white border border-zinc-800 rounded-xl px-4 py-3 outline-none"
                />

                <button
                  onClick={sendMessage}
                  className="bg-white text-black px-5 rounded-xl font-semibold"
                >
                  Send
                </button>

              </div>

            </div>

          </div>
        )
      }

    </>
  );
}