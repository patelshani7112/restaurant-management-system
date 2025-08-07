/* =================================================================
 * PATH: frontend-web/src/components/layout/Sidebar.tsx
 * ================================================================= */
import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardIcon,
  UsersIcon,
  ScheduleIcon,
  InventoryIcon,
  SettingsIcon,
} from "../shared/icons";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const userRole = user?.role_name;
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);

  const allLinks = [
    {
      name: "Dashboard",
      href: "/app/dashboard",
      icon: DashboardIcon,
      roles: ["Admin", "Manager", "Staff", "Chef"],
    },
    {
      name: "Users",
      href: "/app/users",
      icon: UsersIcon,
      roles: ["Admin", "Manager"],
    },
    {
      name: "Schedule",
      icon: ScheduleIcon,
      roles: ["Admin", "Manager", "Staff", "Chef"],
      subLinks: [
        {
          name: "Calendar",
          href: "/app/schedule/calendar",
          roles: ["Admin", "Manager", "Staff", "Chef"],
        },
        {
          name: "Time Off",
          href: "/app/schedule/time-off",
          roles: ["Admin", "Manager", "Staff", "Chef"],
        },
      ],
    },
    {
      name: "Inventory",
      href: "/app/inventory",
      icon: InventoryIcon,
      roles: ["Admin", "Manager", "Chef"],
    },
    {
      name: "Settings",
      href: "/app/settings",
      icon: SettingsIcon,
      roles: ["Admin", "Manager", "Staff", "Chef"],
    },
  ];

  const filteredLinks = allLinks.filter(
    (link) => userRole && link.roles.includes(userRole)
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 px-4 py-4 overflow-y-auto bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">RestaurantOS</span>
        </div>

        <nav className="mt-10">
          {filteredLinks.map((link) =>
            link.subLinks ? (
              <div key={link.name}>
                <button
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 mt-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                >
                  <div className="flex items-center">
                    <link.icon />
                    <span className="ml-3">{link.name}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isScheduleOpen ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {isScheduleOpen && (
                  <div className="pl-8">
                    {link.subLinks
                      .filter((sub) => userRole && sub.roles.includes(userRole))
                      .map((subLink) => (
                        <NavLink
                          key={subLink.name}
                          to={subLink.href}
                          onClick={() => {
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `block px-4 py-2 mt-1 text-sm text-gray-400 rounded-md hover:bg-gray-700 hover:text-white ${
                              isActive ? "bg-gray-900 text-white" : ""
                            }`
                          }
                        >
                          {subLink.name}
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.name}
                to={link.href}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 mt-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white ${
                    isActive ? "bg-gray-900 text-white" : ""
                  }`
                }
              >
                <link.icon />
                <span className="ml-3">{link.name}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
