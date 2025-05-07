import { React } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const navigation = [
    { name: "Color Picker", href: "/color-picker", active: location.pathname === "/" },
    {
      name: "Color Trends",
      href: "/report",
      active: location.pathname === "/report",
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Logout successful!");
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  };
  return (
    <Disclosure as="nav" className="bg-white">
      <div className="mx-auto max-w-7xl px-2 mt-4 border-b sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                alt="Victory Farms"
                src={require("./logo.png")}
                className="h-10 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block flex-grow">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group text-black transition-all duration-300 ease-in-out block rounded-md px-2 py-2 text-base font-medium relative overflow-hidden ${
                      item.active
                        ? "text-green-600 hover:text-black"
                        : "text-black"
                    }`}
                  >
                    <span
                      className={`absolute inset-x-0 bottom-1 h-[3px] bg-green-500 transform scale-x-0 transition-transform origin-left group-hover:scale-x-100`}
                    ></span>
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden sm:block">
            <button
  onClick={handleLogout}
  className="ml-auto flex items-center space-x-2 text-red-600 px-6 py-2 rounded-lg text-sm font-medium hover:ring-1 hover:ring-red-600"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M17 4.25A2.25 2.25 0 0 0 14.75 2h-5.5A2.25 2.25 0 0 0 7 4.25v2a.75.75 0 0 0 1.5 0v-2a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-2a.75.75 0 0 0-1.5 0v2A2.25 2.25 0 0 0 9.25 18h5.5A2.25 2.25 0 0 0 17 15.75V4.25Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M14 10a.75.75 0 0 0-.75-.75H3.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 14 10Z" clipRule="evenodd" />
  </svg>
  <span>Logout</span>
</button>

            </div>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={`group text-black transition-all duration-300 ease-in-out block rounded-md px-2 py-2 text-base font-medium relative overflow-hidden ${
                item.active ? "text-green-600 hover:text-black" : "text-black"
              }`}
            >
              <span
                className={`absolute inset-x-0 bottom-1 h-[3px] bg-green-500 transform scale-x-0 transition-transform origin-left group-hover:scale-x-100`}
              ></span>
              {item.name}
            </DisclosureButton>
          ))}
          <DisclosureButton
            onClick={handleLogout}
            className="block w-full text-left text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:ring-red-600"
          >
            Logout
          </DisclosureButton>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

export default Header;
