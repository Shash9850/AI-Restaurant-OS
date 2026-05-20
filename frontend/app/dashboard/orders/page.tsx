"use client";

import { useEffect, useState } from "react";

import api from "@/services/api";

type OrderItem = {
  quantity: number;
  total_price: number;
  menu_item: {
    name: string;
  };
};

type Order = {
  id: number;
  customer_name: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  items?: OrderItem[];
};

export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders = async () => {

    try {

      const response = await api.get(
        "/orders/all"
      );

      setOrders(response.data.data);

    } catch (error) {

      console.log(error);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    status: string
  ) => {

    try {

      await api.put(
        `/orders/${orderId}/status?status=${status}`
      );

      fetchOrders();

    } catch (error) {

      console.log(error);
    }
  };

  return (
    <div>

      <div className="mb-10">

        <h1 className="text-4xl font-bold mb-2">
          Live Orders
        </h1>

        <p className="text-zinc-400">
          Monitor and manage restaurant orders
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {
          orders.map((order) => (

            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="text-2xl font-semibold">
                    Order #{order.id}
                  </h2>

                  <p className="text-zinc-400">
                    {order.customer_name}
                  </p>

                </div>

                <span
                  className={`
                    px-4 py-2 rounded-full text-sm capitalize

                    ${
                      order.order_status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : order.order_status === "preparing"
                        ? "bg-blue-500/20 text-blue-400"
                        : order.order_status === "ready"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-zinc-700 text-zinc-300"
                    }
                  `}
                >
                  {order.order_status}
                </span>

              </div>

              <div className="space-y-2 mb-6">

                <p className="text-zinc-300">
                  Total: ₹{order.total_amount}
                </p>

                <p className="text-zinc-500 text-sm">
                  {order.notes}
                </p>

              </div>

              <div className="border-t border-zinc-800 pt-4">

                <h3 className="font-semibold mb-3">
                  Items
                </h3>

                <div className="space-y-2">

                  {
                    order.items?.map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center justify-between text-zinc-300"
                      >

                        <span>
                          {item.menu_item.name}
                          {" "}
                          ×
                          {" "}
                          {item.quantity}
                        </span>

                        <span>
                          ₹{item.total_price}
                        </span>

                      </div>
                    ))
                  }

                </div>

              </div>

              <div className="flex gap-2 mt-6">

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.id,
                      "preparing"
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                >
                  Preparing
                </button>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.id,
                      "ready"
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                >
                  Ready
                </button>

                <button
                  onClick={() =>
                    updateOrderStatus(
                      order.id,
                      "served"
                    )
                  }
                  className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm"
                >
                  Served
                </button>

              </div>

            </div>
          ))
        }

      </div>

    </div>
  );
}