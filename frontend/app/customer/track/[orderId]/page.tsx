"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import api from "@/services/api";

type Order = {
  id: number;
  customer_name: string;
  order_status: string;
  total_amount: number;
  notes: string;
};

export default function TrackOrderPage() {

  const params = useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  useEffect(() => {

    fetchOrder();

    const interval = setInterval(
      fetchOrder,
      5000
    );

    return () => clearInterval(interval);

  }, []);

  const fetchOrder = async () => {

    try {

      const response = await api.get(
        `/orders/${params.orderId as string}`
      );

      setOrder(response.data.data);

    } catch (error) {

      console.log(error);
    }
  };

  const getStatusMessage = () => {

    if (!order) return "";

    switch (order.order_status) {

      case "pending":
        return "Your order has been received";

      case "preparing":
        return "Kitchen is preparing your food";

      case "ready":
        return "Your order is ready to serve";

      case "served":
        return "Order delivered successfully";

      default:
        return "";
    }
  };

  const getStatusColor = () => {

    if (!order) return "";

    switch (order.order_status) {

      case "pending":
        return "text-yellow-400";

      case "preparing":
        return "text-blue-400";

      case "ready":
        return "text-green-400";

      case "served":
        return "text-zinc-300";

      default:
        return "";
    }
  };

  if (!order) {

    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        Loading...

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">

        <div className="mb-8">

          <h1 className="text-3xl font-bold mb-3">
            Order Tracking
          </h1>

          <p className="text-zinc-400">
            Order #{order.id}
          </p>

        </div>

        <div className="mb-10">

          <div className="w-32 h-32 rounded-full border-4 border-zinc-700 flex items-center justify-center mx-auto mb-6">

            <div
              className={`
                text-2xl font-bold capitalize
                ${getStatusColor()}
              `}
            >
              {order.order_status}
            </div>

          </div>

          <p className="text-lg text-zinc-300">
            {getStatusMessage()}
          </p>

        </div>

        <div className="bg-zinc-950 rounded-2xl p-5 text-left">

          <div className="flex justify-between mb-3">

            <span className="text-zinc-400">
              Customer
            </span>

            <span>
              {order.customer_name}
            </span>

          </div>

          <div className="flex justify-between mb-3">

            <span className="text-zinc-400">
              Total
            </span>

            <span>
              ₹{order.total_amount}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-zinc-400">
              Notes
            </span>

            <span>
              {order.notes || "-"}
            </span>

          </div>

        </div>

      </div>

    </main>
  );
}