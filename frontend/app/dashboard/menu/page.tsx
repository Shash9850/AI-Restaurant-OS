"use client";

import { useEffect, useState } from "react";

import api from "@/services/api";

type Category = {
  id: number;
  name: string;
};

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  spicy_level: string;
};

export default function MenuPage() {

  const [categories, setCategories] = useState<Category[]>([]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [itemForm, setItemForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    is_veg: true,
    spicy_level: "",
    preparation_time: "",
    image_url: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {

    fetchMenuItems();

  }, []);


  const uploadImage = async (
  file: File
) => {

  try {

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    const response = await api.post(
      "/menu/upload-image",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    setItemForm({
      ...itemForm,
      image_url:
        response.data.image_url,
    });

    alert("Image uploaded");

  } catch (error) {

    console.log(error);

    alert("Upload failed");
  }
};

  const fetchMenuItems = async () => {

    try {

      const response = await api.get(
        "/menu/items",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMenuItems(response.data.data);

    } catch (error) {

      console.log(error);
    }
  };

  const createCategory = async () => {

    try {

      const response = await api.post(
        "/menu/categories",
        categoryForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategories([
        ...categories,
        response.data.data,
      ]);

      setCategoryForm({
        name: "",
        description: "",
      });

      alert("Category created");

    } catch (error) {

      console.log(error);
    }
  };

  const createMenuItem = async () => {

    try {

      await api.post(
        "/menu/items",
        {
          ...itemForm,
          image_url: itemForm.image_url,
          category_id: Number(itemForm.category_id),
          price: Number(itemForm.price),
          preparation_time: Number(
            itemForm.preparation_time
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Menu item created");

      fetchMenuItems();

    } catch (error) {

      console.log(error);
    }
  };

  return (
    <div>

      <div className="mb-10">

        <h1 className="text-4xl font-bold mb-2">
          Menu Management
        </h1>

        <p className="text-zinc-400">
          Manage restaurant menu and dishes
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Create Category
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Category Name"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  name: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <input
              type="text"
              placeholder="Description"
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <button
              onClick={createCategory}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold"
            >
              Create Category
            </button>

          </div>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Add Menu Item
          </h2>

          <div className="space-y-4">

            <input
              type="number"
              placeholder="Category ID"
              value={itemForm.category_id}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  category_id: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <input
              type="text"
              placeholder="Dish Name"
              value={itemForm.name}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  name: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <input
              type="text"
              placeholder="Description"
              value={itemForm.description}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  description: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <input
              type="number"
              placeholder="Price"
              value={itemForm.price}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  price: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <input
              type="text"
              placeholder="Spicy Level"
              value={itemForm.spicy_level}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  spicy_level: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            />

            <div>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      if (
        e.target.files &&
        e.target.files[0]
      ) {

        uploadImage(
          e.target.files[0]
        );
      }
    }}
    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
  />

  {
    itemForm.image_url && (

      <img
        src={itemForm.image_url}
        alt="Preview"
        className="w-32 h-32 object-cover rounded-xl mt-4"
      />
    )
  }

</div>

            <button
              onClick={createMenuItem}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold"
            >
              Add Menu Item
            </button>

          </div>

        </div>

      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-semibold mb-6">
          Menu Items
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {
            menuItems.map((item) => (

              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >

                <div className="flex items-center justify-between mb-3">

                  <h3 className="text-xl font-semibold">
                    {item.name}
                  </h3>

                  <span className="text-lg font-bold">
                    ₹{item.price}
                  </span>

                </div>

                <p className="text-zinc-400 mb-4">
                  {item.description}
                </p>

                <div className="flex gap-3 text-sm">

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
            ))
          }

        </div>

      </div>

    </div>
  );
}