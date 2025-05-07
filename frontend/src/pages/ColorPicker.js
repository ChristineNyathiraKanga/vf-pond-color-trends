import React, { useState, useRef, useCallback } from "react";
import "../App.css";
import Header from "../components/Header";
import { format, toZonedTime } from "date-fns-tz";
import ColorPalette from "../components/ColorPalette";
import { PhotoIcon } from "@heroicons/react/24/outline";
import useEyeDropper from "use-eye-dropper";
import Swal from "sweetalert2";

const ColorPicker = () => {
  const timeZone = "Africa/Nairobi";
  const imageRef = useRef(null);
  const now = new Date();
  const initialDate = toZonedTime(now, timeZone);
  const [date, setDate] = useState(
    format(initialDate, "yyyy-MM-dd'T'HH:mm", { timeZone })
  );

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
    "MB13",
    "MB14",
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
    "H0-01",
    "H0-07",
    "H0_08",
    "H0-09",
    "H0-02",
    "H0-05",
    "H0-03",
    "H0-04",
    "H0-06",
    "H1-01",
    "H1-02",
    "H1-03",
    "H1-04",
    "H1-05",
    "H1-06",
    "H1-07",
    "H1-08",
    // "HEAP 2 Ponds",
    "H2-01",
    "H2-02",
    "H2-03",
    "H2-04",
    "H2-05",
    "H2-06",
    "H2-07",
    "H2-08",
    "H2-09",
    "H2-10",
    "H2-11",
    "H2-12",
    "H2-13",
    "W6",
  ];

  const ImageUpload = () => {

  const { open } = useEyeDropper();

  const [numEntries, setNumEntries] = useState(1);
  const [selections, setSelections] = useState(
    Array.from({ length: 20 }, () => ({
      category: "HERO",
      pond: "A1",
      color: null,
      closestColor: null,
    }))
  );
  const [image, setImage] = useState(null);
  const [imageFilename, setImageFilename] = useState("");
  const [dragging, setDragging] = useState(false);

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

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };


  const handleDrop = (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target.result);
          setImageFilename(file.name);
        };
        reader.readAsDataURL(file);
      }
    };

 
  const handleSelectionChange = useCallback((index, field, value) => {
    const updatedSelections = [...selections];
    updatedSelections[index][field] = value;
    setSelections(updatedSelections);
  }, [selections]);

  const handleReset = () => {
    setImage(null);
    
   if (imageRef.current) {
      imageRef.current.value = null;
    }

    setSelections([]); 
    window.location.reload();
  };
  

  const handleColorPick = useCallback(async (index) => {
    try {
      const result = await open();
      const color = result.sRGBHex;
  
      const response = await fetch('http://127.0.0.1:5000/match-color', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sRGBHex: color }),
      });
  
      const data = await response.json();
      handleSelectionChange(index, 'color', color);
      handleSelectionChange(index, 'closestColor', data);
    } catch (e) {
      console.error(e);
    }
  }, [open, handleSelectionChange]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const zonedDate = toZonedTime(new Date(date), timeZone);

    const payload = {
      image,
      imageFilename,
      selections: selections.slice(0, numEntries), // Limit to the number of entries selected by the user
      date: zonedDate.toString(),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/submit", {
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
        setTimeout(() => window.location.reload(), 3000);
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

  return (
    <div className="">
      <Header />
      <main>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="px-6 py-6 w-full">
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-6">
              <div className="order-2 lg:col-span-3">
                <div className="mb-4 mt-0">
                  <label className="block py-2 text-sm font-medium text-black">
                    How many entries do you need?
                  </label>
                  <input
                    type="number"
                    value={numEntries}
                    onChange={(e) => setNumEntries(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                  />
                </div>

                <div
                  className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
                    dragging ? "bg-gray-100" : ""
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
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2 hover:text-green-500"
                          >
                            <span>Upload an image</span>
                            <input
                              id="image"
                              name="image"
                              type="file"
                              onChange={handleImageUpload}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    ) : (
                      <div className="relative">
                        <img
                          ref={imageRef}
                          src={image}
                          alt="Uploaded"
                          className="mx-auto max-h-96"
                        />
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
                <div className="order-2 lg:col-span-3">
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
                        <div className="mt-6 max-h-96 overflow-y-auto scrollbar-thumb-gray-900 scrollbar-track-gray-100">
                  <div
                    className={`mt-6 grid ${
                      numEntries > 1
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2"
                        : "grid-cols-1"
                    } `}
                  >
                    
                    {selections.slice(0, numEntries).map((selection, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-300 rounded-md"
                      >
                        
                        <label className="block text-sm font-medium text-black">
                          Category {index + 1}
                        </label>
                        <select
                          value={selection.category}
                          onChange={(e) =>
                            handleSelectionChange(
                              index,
                              "category",
                              e.target.value
                            )
                          }
                          className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>

                        <label className="block text-sm font-medium text-black mt-4">
                          Pond {index + 1}
                        </label>
                        <select
                          value={selection.pond}
                          onChange={(e) =>
                            handleSelectionChange(index, "pond", e.target.value)
                          }
                          className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                        >
                          {ponds.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>

                        {selection.closestColor && (
                          <div>
                            <label className="block mt-2 text-sm font-medium text-black">
                              Color in Palette:
                            </label>
                            <div
                              style={{
                                backgroundColor: selection.closestColor.code,
                              }}
                              className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                            >
                              <p className="text-sm">
                                <span className="p-2 text-white">
                                  {selection.closestColor.name} (
                                  {selection.closestColor.code})
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleColorPick(index)}
                          className="mt-2 mx-auto items-center py-2 px-4 bg-white text-green-600 font-medium rounded-md ring-green-600 shadow-md  focus-within:outline-none focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2 hover:text-green-500"
                        >
                          Pick Color {index + 1}
                        </button>
                      </div>
                    ))}
                  </div>
                 
                </div>
                </div>
              
                </div>
                <button
                      type="submit" 
                      className="w-full py-2 mt-4 px-4 bg-green-600 text-white font-medium rounded-md shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2 focus-within:bg-white focus-within:text-green-600 hover:bg-white hover:text-green-600"
                    >
                      Submit
                    </button>
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
