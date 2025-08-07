// /* =================================================================
//  * PATH: frontend-web/src/components/layout/Sidebar.tsx
//  * ================================================================= */
// import React from "react";
// import { NavLink } from "react-router-dom";
// import {
//   DashboardIcon,
//   UsersIcon,
//   ScheduleIcon,
//   InventoryIcon,
//   SettingsIcon,
// } from "../shared/icons";
// import { useAuth } from "../../contexts/AuthContext"; // 1. Import useAuth

// interface SidebarProps {
//   sidebarOpen: boolean;
//   setSidebarOpen: (open: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
//   const { user } = useAuth(); // 2. Get user from context
//   const userRole = user?.role_name;

//   const allLinks = [
//     {
//       name: "Dashboard",
//       href: "/app/dashboard",
//       icon: DashboardIcon,
//       roles: ["Admin", "Manager", "Staff", "Chef"],
//     },
//     {
//       name: "Users",
//       href: "/app/users",
//       icon: UsersIcon,
//       roles: ["Admin", "Manager"],
//     },
//     {
//       name: "Schedule",
//       href: "/app/schedule",
//       icon: ScheduleIcon,
//       roles: ["Admin", "Manager", "Staff", "Chef"],
//     },
//     {
//       name: "Inventory",
//       href: "/app/inventory",
//       icon: InventoryIcon,
//       roles: ["Admin", "Manager", "Chef"],
//     },
//     {
//       name: "Settings",
//       href: "/app/settings",
//       icon: SettingsIcon,
//       roles: ["Admin", "Manager", "Staff", "Chef"],
//     },
//   ];

//   const filteredLinks = allLinks.filter(
//     (link) => userRole && link.roles.includes(userRole)
//   );

//   // ... (The rest of the JSX remains the same)
//   return (
//     <>
//       <div
//         className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
//           sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setSidebarOpen(false)}
//       ></div>

//       <div
//         className={`fixed inset-y-0 left-0 z-30 w-64 px-4 py-4 overflow-y-auto bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex items-center justify-between">
//           <span className="text-xl font-bold">RestaurantOS</span>
//         </div>

//         <nav className="mt-10">
//           {filteredLinks.map((link) => (
//             <NavLink
//               key={link.name}
//               to={link.href}
//               onClick={() => {
//                 if (window.innerWidth < 1024) setSidebarOpen(false);
//               }}
//               className={({ isActive }) =>
//                 `flex items-center px-4 py-2 mt-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white ${
//                   isActive ? "bg-gray-900 text-white" : ""
//                 }`
//               }
//             >
//               <link.icon />
//               <span className="ml-3">{link.name}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
