"use client";

import Link from "next/link";

import {
  LuLayoutDashboard,
  LuUtensilsCrossed,
  LuClipboardList,
  LuTable2,
  LuBot,
  LuSettings
} from "react-icons/lu";

const menuItems = [
  {
    title: "Dashboard",
    icon: LuLayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Menu",
    icon: LuUtensilsCrossed,
    href: "/dashboard/menu",
  },
  {
    title: "Orders",
    icon: LuClipboardList,
    href: "/dashboard/orders",
  },
  {
    title: "Tables",
    icon: LuTable2,
    href: "/dashboard/tables",
  },
  {
    title: "AI Assistant",
    icon: LuBot,
    href: "/dashboard/ai",
  },
  {
    title: "Settings",
    icon: LuSettings,
    href: "/dashboard/settings",
  },
];

export default function Sidebar() {

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800 p-6 hidden md:flex flex-col">

      <div className="mb-10">

        <h1 className="text-2xl font-bold text-white">
          AI Restaurant OS
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Restaurant Control Center
        </p>

      </div>

      <nav className="space-y-2">

        {
          menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
              >

                <Icon size={20} />

                <span>
                  {item.title}
                </span>

              </Link>
            );
          })
        }

      </nav>

    </aside>
  );
}