import React, { useState, useRef, useCallback } from "react";
import "../App.css";
import Header from "../components/Header";
import { format, toZonedTime } from "date-fns-tz";
import ColorPalette from "../components/ColorPalette";
import { PhotoIcon } from "@heroicons/react/24/outline";
import useEyeDropper from "use-eye-dropper";
import Swal from "sweetalert2";

const ColorPicker = () => {

  // Initialize constants for image, timezone, ponds, categories, and time
  const timeZone = "Africa/Nairobi";
  const imageRef = useRef(null);
  const now = new Date();
  // Convert current time to Nairobi time
  const initialDate = toZonedTime(now, timeZone);
  const [date, setDate] = useState(
    format(initialDate, "yyyy-MM-dd'T'HH:mm", { timeZone })
  );

  const [category, setCategory] = useState("HERO");
  const [pond, setPond] = useState("A1");
  const categories = [
    "HERO",
    "Broodstock",
    "Nursery",
    "Community",
    "HEAP 1",
    "HEAP 2",
    "Cat Fish",
  ];
  const ponds = [
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
    "A9",
    "A10",
    "A11",
    "A12",
    "A13",
    "A14",
    "A15",
    "A16",
    "A17",
    "A18",
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "B8",
    "B9",
    "B10",
    "B11",
    "MB12",
    "MB13",
    "MB14",
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
    "Alex's Pond",
    "Alex II",
    "Birgita",
    "Wilson's",
    "Elias",
    "Joseph",
    "Mark",
    "RW01",
    "RW02",
    "RW03",
    "RW04",
    "RW05",
    "RW06",
    "RW07",
    "RW08",
    "HEAP 2 Ponds",
    "W6",
  ];

  const { open } = useEyeDropper();

  const ImageUpload = () => {
    const [image, setImage] = useState(null);
    const [imageFilename, setImageFilename] = useState("");
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = (event) => {
      const reader = new FileReader();

      const file = event.target.files[0];
      reader.onload = (e) => {
        setImage(e.target.result);
        setImageFilename(file.name);
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    };

    const handleReset = () => {
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      setColor(null);
      if (colorInputRef.current) {
        colorInputRef.current.value = null;
      }

      setClosestColor(null);
      if (closestColorInputRef.current) {
        closestColorInputRef.current.value = null;
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Convert date back to UTC
      const zonedDate = toZonedTime(new Date(date), timeZone);

      const payload = {
        image,
        imageFilename,
        closestColor,
        category,
        pond,
        date: zonedDate.toString(),
      };

      try {
        // const response = await fetch('${API_URL}/backend/submit', {
        const response = await fetch('${API_URL}/backend/submit', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
          Swal.fire({
            title: "Success",
            text: result.message,
            icon: "success",
            confirmButtonText: "Done",
          });
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        } else {
          Swal.fire({
            title: "Error",
            text: result.message,
            confirmButtonText: "Done",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while submitting the data.");
      }
    };

    // eslint-disable-next-line no-unused-vars
    const [color, setColor] = useState(null);
    const [closestColor, setClosestColor] = useState(null);
    const colorInputRef = useRef(null);
    const closestColorInputRef = useRef(null);

    const handleColorPick = useCallback(async () => {
      try {
        const result = await open();
        setColor(result.sRGBHex);

        // const response = await fetch('${API_URL}/backend/match-color', {
        const response = await fetch('${API_URL}/backend/match-color', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sRGBHex: result.sRGBHex }),
        });

        const data = await response.json();
        setClosestColor(data);
      } catch (e) {
        console.error(e);
      }
    }, [setColor, setClosestColor]);

    const handleFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setImageFilename(file.name);
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      setDragging(true);
    };

    const handleDragLeave = () => {
      setDragging(false);
    };

    const handleDrop = (event) => {
      event.preventDefault();
      setDragging(false);

      const file = event.dataTransfer.files[0];
      handleFile(file);
    };


    return (
      <div className="">
        <Header />
        <main>
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="border px-10 py-10 w-full">
              <form onSubmit={handleSubmit} className="p-4">
                {/* <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-5"> */}


                {/* other div */}
                <div className="order-1 lg:col-span-2">
                  <div className="mb-4">
                    <label className="block py-2 text-sm font-medium text-black">
                      Select Date and Time
                    </label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">
                      Pond
                    </label>
                    <select
                      value={pond}
                      onChange={(e) => setPond(e.target.value)}
                      className=" py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                    >
                      {ponds.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    {closestColor && (
                      <div ref={closestColorInputRef}>
                        <label className="block mt-2 text-sm font-medium text-black">
                          Color in Palette:
                        </label>
                        <div
                          style={{ backgroundColor: closestColor.code }}
                          className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                        >
                          <p className="text-sm">
                            <span className="p-2 text-white">
                              {closestColor.name} ({closestColor.code})
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md shadow-sm"
                  >
                    Submit
                  </button>
                </div>
                {/* image div */}
                <div className="order-2 lg:col-span-3">
                  <div
                    className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${dragging ? "bg-gray-100" : ""
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      {!image ? (
                        <>
                          <PhotoIcon
                            className="mx-auto h-12 w-12 text-gray-300"
                            aria-hidden="true"
                          />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="image"
                              className="relative cursor-pointer rounded-md font-semibold text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2 hover:text-green-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="image"
                                name="image"
                                accept="image/*"
                                type="file"
                                onChange={handleImageUpload}
                                className="sr-only"
                                ref={fileInputRef}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      ) : (
                        <div>
                          <div
                            className="flex items-center bg-blue-500 px-4 py-3 text-sm font-bold text-white"
                            role="alert"
                          >
                            <svg
                              className="mr-2 h-4 w-4 fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                            </svg>
                            <p>
                              Click once to activate or deactivate color
                              dropper
                            </p>
                          </div>

                          {image && (
                            <img
                              src={image}
                              alt="Uploaded"
                              ref={imageRef}
                              onClick={handleColorPick}
                              className="mt-4 w-full h-auto rounded-lg"
                            />
                          )}

                          <button
                            type="button"
                            onClick={handleReset}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* </div> */}
              </form>

              <ColorPalette />
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div>
      <ImageUpload />
      {/* <Footer /> */}
    </div>
  );
};

export default ColorPicker;
