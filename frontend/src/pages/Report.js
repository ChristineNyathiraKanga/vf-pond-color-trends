import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import axios from "axios";
import * as XLSX from "xlsx";
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import Swal from "sweetalert2";

// use env Global URL instead of hardcoded URL
const API_URL = process.env.GLOBAL_URL;

export const Report = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);;
  const [itemsPerPage] = useState(20);

  const fetchData = _.debounce(async () => {
    try {
      const response = await axios.get(`${API_URL}/submitted-data`);
      setData(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, 300);

  useEffect(() => {
    fetchData();
    return () => {
      fetchData.cancel();
    };
  }, [fetchData]);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const subset = data.slice(startIndex, endIndex);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const openModal = (file) => {
    setModalContent(file);
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];
    const headers = ["Category", "Pond"];

    // Extract unique dates and normalize them to a consistent format
    const uniqueDates = [
      ...new Set(data.map((item) => new Date(item.date).toISOString().split("T")[0]))
    ].sort((a, b) => new Date(a) - new Date(b));

    uniqueDates.forEach((date) => {
      headers.push({
        v: new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        s: { font: { bold: true } },
      });
    });

    worksheetData.push(headers);

    // Create a map to aggregate data by category and pond
    const aggregatedData = new Map();

    data.forEach((item) => {
      const key = `${item.category}-${item.pond}`;
      if (!aggregatedData.has(key)) {
        aggregatedData.set(key, {
          category: item.category,
          pond: item.pond,
          dateData: {},
        });
      }
      const entry = aggregatedData.get(key);
      const dateKey = new Date(item.date).toISOString().split("T")[0];
      entry.dateData[dateKey] = item.closestColorName;
    });

    aggregatedData.forEach((value) => {
      const row = [value.category, value.pond];
      uniqueDates.forEach((date) => {
        row.push(value.dateData[date] || "");
      });
      worksheetData.push(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Pond Color");

    XLSX.writeFile(workbook, "VF_Ponds_Color_Trends.xlsx");
  };



  const handleDelete = async (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/backend/delete-data/${item.id}`);

          setData((prevData) => prevData.filter((record) => record.id !== item.id));

          fetchData.cancel();
          fetchData.flush();

          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the record.", error,
            icon: "error"
          });
        }
      }
    });
  };


  return (
    <div className="overscroll-none py-2">
      <Header />

      <section className="px-4">
        <div className="lg:mx-10 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium px-3 text-black mb-2">

          </h2>

          <div className="flex items-center px-8 mt-2 mb-4 gap-x-3 lg:float-right">
            <button
              onClick={exportToExcel}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-green-600 rounded-lg gap-x-2 hover:bg-green-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>

              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg lg:mx-12">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-4 text-sm font-normal text-left text-black">
                  Image
                </th>
                <th className="px-4 py-4 text-sm font-normal text-left text-black">
                  Color
                </th>
                <th className="px-4 py-4 text-sm font-normal text-left text-black">
                  Category
                </th>
                <th className="px-4 py-4 text-sm font-normal text-left text-black">
                  Pond
                </th>
                <th className="px-4 py-4 text-sm font-normal text-left text-black">
                  Date & Time
                </th>
                <th className="py-4 px-4 text-sm font-normal text-left text-black"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(subset) && subset.map((item, index) =>
                <tr key={`${item.imageFilename}-${index}`}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-x-3">
                      <div className="w-8 h-8 flex items-center justify-center text-green-500 bg-green-100 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-medium text-wrap text-black">
                          {item.imageFilename}
                        </h2>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-white whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-x-2 rounded-full px-3 py-1"
                      style={{ backgroundColor: item.closestColor }}
                    >
                      <h2 className="text-sm font-normal text-white">
                        {item.closestColorName}
                      </h2>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-black whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="px-4 py-4 text-sm text-black whitespace-nowrap">
                    {item.pond}
                  </td>
                  <td className="px-4 py-4 text-sm text-black whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <button
                      className="text-black transition-colors duration-200 hover:text-green-500 focus:outline-none"
                      onClick={() => openModal(item)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red transition-colors float-right duration-200 hover:text-red-500 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                      </svg>


                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div>
                <img
                  src={`${API_URL}/backend/${modalContent.imageFilename}`}


                  alt={modalContent.imageFilename}
                  className="mt-4 w-full h-auto rounded-lg"
                />
              </div>

              <div>
                <label className="block mt-2 text-sm font-medium text-black">
                  Color in Palette:
                </label>
                <div
                  style={{ backgroundColor: modalContent.closestColor }}
                  className="py-1 px-2 mt-1 block w-full border border-gray-300 shadow-sm rounded-md"
                >
                  <p className="text-sm">
                    <span className="p-2 text-white">
                      {modalContent.closestColorName} (
                      {modalContent.closestColor})
                    </span>
                  </p>
                </div>
              </div>

              <button
                className="mt-4 px-4 py-2 bg-red-500 float-right text-white rounded-lg hover:bg-red-600"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <section className="lg:mx-10 mx-auto px-4">
          <div className="mt-6 flex-direction items-center justify-between content-center">

            <ReactPaginate
              pageCount={totalPages}
              onPageChange={handlePageChange}
              breakLabel={"..."}
              activeClassName={"active-page bg-green-100/60 px-2 py-1 text-sm text-black rounded-md"}
              previousLabel={
                <button className="flex float-left items-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-black transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Previous</span>
                </button>
              }
              nextLabel={
                <button className="flex float-right items-center gap-x-2 rounded-md border bg-white px-5 py-2 text-sm capitalize text-black transition-colors duration-200">
                  <span>Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              }
              containerClassName={"flex justify-between items-center gap-x-3"}
              pageLinkClassName={"rounded-md px-2 py-1 text-sm text-black hover:bg-green-100/60"}
              breakLinkClassName={"rounded-md px-2 py-1 text-sm text-black"}
              disabledClassName={"cursor-not-allowed opacity-50"}
            />


          </div>
        </section>
      </section>
    </div>
  );
};
