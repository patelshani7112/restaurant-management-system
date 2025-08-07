// /* =================================================================
//  * PATH: frontend-web/src/pages/SchedulePage.tsx
//  * ================================================================= */
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
// import type { SlotInfo, Event, View } from "react-big-calendar";
// import format from "date-fns/format";
// import parse from "date-fns/parse";
// import startOfWeek from "date-fns/startOfWeek";
// import endOfWeek from "date-fns/endOfWeek";
// import startOfMonth from "date-fns/startOfMonth";
// import endOfMonth from "date-fns/endOfMonth";
// import startOfDay from "date-fns/startOfDay";
// import endOfDay from "date-fns/endOfDay";
// import getDay from "date-fns/getDay";
// import differenceInMinutes from "date-fns/differenceInMinutes";
// import { enUS } from "date-fns/locale";
// import addMonths from "date-fns/addMonths";
// import subMonths from "date-fns/subMonths";
// import addDays from "date-fns/addDays";
// import subDays from "date-fns/subDays";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import axiosClient from "../api/axiosClient";
// import AddShiftModal from "../components/schedule/AddShiftModal";
// import EditShiftModal from "../components/schedule/EditShiftModal";

// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
//   getDay,
//   locales,
// });

// // --- TYPE DEFINITIONS ---
// interface UserProfile {
//   id: string;
//   first_name: string;
//   last_name: string;
//   schedule_color: string;
//   role_name: string;
// }

// interface Shift extends Event {
//   id: number;
//   user_id: string;
//   resource?: { color: string };
// }

// // --- CUSTOM COMPONENTS ---
// const ShiftEvent: React.FC<{ event: Shift }> = ({ event }) => {
//   return (
//     <div className="h-full p-1 flex flex-col justify-start">
//       <p className="font-semibold text-xs truncate">{event.title}</p>
//       <p className="text-xs">{`${format(event.start as Date, "p")} - ${format(
//         event.end as Date,
//         "p"
//       )}`}</p>
//     </div>
//   );
// };

// // --- MAIN SCHEDULE PAGE COMPONENT ---
// const SchedulePage: React.FC = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [currentView, setCurrentView] = useState<View | "custom">(Views.WEEK);
//   const [customRange, setCustomRange] = useState({
//     start: startOfWeek(new Date(), { weekStartsOn: 1 }),
//     end: endOfWeek(new Date(), { weekStartsOn: 1 }),
//   });
//   const [allShifts, setAllShifts] = useState<Shift[]>([]);
//   const [users, setUsers] = useState<UserProfile[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
//   const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

//   const [selectedUserId, setSelectedUserId] = useState<string>("all");
//   const [scheduleId, setScheduleId] = useState<number | null>(null);
//   const [hourBudget, setHourBudget] = useState(160);

//   const currentUser: UserProfile = useMemo(
//     () => JSON.parse(localStorage.getItem("user_profile") || "{}"),
//     []
//   );
//   const isManagerOrAdmin = useMemo(
//     () => ["Admin", "Manager"].includes(currentUser.role_name),
//     [currentUser]
//   );

//   const dateRange = useMemo(() => {
//     if (currentView === "custom")
//       return {
//         start: startOfDay(customRange.start),
//         end: endOfDay(customRange.end),
//       };
//     if (currentView === Views.DAY)
//       return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
//     if (currentView === Views.MONTH)
//       return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
//     return {
//       start: startOfWeek(currentDate, { weekStartsOn: 1 }),
//       end: endOfWeek(currentDate, { weekStartsOn: 1 }),
//     };
//   }, [currentDate, currentView, customRange]);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       let usersData: UserProfile[];
//       if (isManagerOrAdmin) {
//         const usersResponse = await axiosClient.get("/users");
//         usersData = usersResponse.data;
//       } else {
//         usersData = [currentUser];
//       }
//       setUsers(usersData);

//       const weekStartDate = format(
//         startOfWeek(currentDate, { weekStartsOn: 1 }),
//         "yyyy-MM-dd"
//       );
//       const scheduleResponse = await axiosClient.get(
//         `/schedules/week/${weekStartDate}`
//       );
//       setScheduleId(scheduleResponse.data.schedule?.id || null);

//       const shiftsResponse = await axiosClient.get("/schedules/shifts", {
//         params: {
//           startDate: dateRange.start.toISOString(),
//           endDate: dateRange.end.toISOString(),
//         },
//       });

//       const userMap = new Map(usersData.map((u: UserProfile) => [u.id, u]));
//       const formattedShifts = shiftsResponse.data.map((shift: any) => {
//         const user = userMap.get(shift.user_id);
//         return {
//           ...shift,
//           start: new Date(shift.start_time),
//           end: new Date(shift.end_time),
//           title: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
//           resource: { color: user?.schedule_color || "#E5E7EB" },
//         };
//       });
//       setAllShifts(formattedShifts);
//     } catch (err) {
//       setError("Failed to fetch schedule data.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [dateRange, currentDate, isManagerOrAdmin, currentUser]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const userHoursMap = useMemo(() => {
//     const map = new Map<string, number>();
//     allShifts.forEach((shift) => {
//       const calcStart = Math.max(
//         shift.start.getTime(),
//         dateRange.start.getTime()
//       );
//       const calcEnd = Math.min(shift.end.getTime(), dateRange.end.getTime());
//       if (calcEnd > calcStart) {
//         const duration = differenceInMinutes(calcEnd, calcStart);
//         const currentHours = map.get(shift.user_id) || 0;
//         map.set(shift.user_id, currentHours + duration);
//       }
//     });
//     return map;
//   }, [allShifts, dateRange]);

//   const filteredShifts = useMemo(() => {
//     if (isManagerOrAdmin) {
//       if (selectedUserId === "all") return allShifts;
//       return allShifts.filter((shift) => shift.user_id === selectedUserId);
//     }
//     return allShifts.filter((shift) => shift.user_id === currentUser.id);
//   }, [allShifts, selectedUserId, isManagerOrAdmin, currentUser.id]);

//   const totalHours = useMemo(() => {
//     const totalMinutes = filteredShifts.reduce((acc, shift) => {
//       const duration = differenceInMinutes(
//         shift.end as Date,
//         shift.start as Date
//       );
//       return acc + duration;
//     }, 0);
//     return (totalMinutes / 60).toFixed(2);
//   }, [filteredShifts]);

//   const remainingHours = useMemo(
//     () => hourBudget - parseFloat(totalHours),
//     [hourBudget, totalHours]
//   );

//   const handlePrev = () => {
//     let newDate;
//     if (currentView === "day") newDate = subDays(currentDate, 1);
//     else if (currentView === "month") newDate = subMonths(currentDate, 1);
//     else newDate = subDays(currentDate, 7);
//     setCurrentDate(newDate);
//   };

//   const handleNext = () => {
//     let newDate;
//     if (currentView === "day") newDate = addDays(currentDate, 1);
//     else if (currentView === "month") newDate = addMonths(currentDate, 1);
//     else newDate = addDays(currentDate, 7);
//     setCurrentDate(newDate);
//   };

//   const handleToday = () => setCurrentDate(new Date());
//   const handleView = (view: View | "custom") => setCurrentView(view);

//   const handleSelectSlot = (slotInfo: SlotInfo) => {
//     if (!isManagerOrAdmin || new Date(slotInfo.start) < new Date()) return;
//     setSelectedSlot(slotInfo);
//     setIsAddModalOpen(true);
//   };

//   const handleSelectEvent = (event: Shift) => {
//     if (!isManagerOrAdmin || new Date(event.start as Date) < new Date()) return;
//     setSelectedShift(event);
//     setIsEditModalOpen(true);
//   };

//   const eventStyleGetter = (event: Shift) => {
//     const isPast = new Date(event.start as Date) < new Date();
//     const backgroundColor = event.resource?.color || "#E5E7EB";

//     const style = {
//       backgroundColor: backgroundColor,
//       borderRadius: "5px",
//       opacity: isPast ? 0.6 : 0.9,
//       color: "#1F2937",
//       border: "1px solid #9CA3AF",
//       display: "block",
//       cursor: isPast && isManagerOrAdmin ? "not-allowed" : "pointer",
//     };
//     return { style };
//   };

//   const handleNavigate = (newDate: Date) => setCurrentDate(newDate);
//   const handleDrillDown = (newDate: Date) => {
//     setCurrentView("day");
//     setCurrentDate(newDate);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">
//             Employee Schedule
//           </h1>
//           <p className="text-gray-500 mt-1">
//             {isManagerOrAdmin
//               ? "Manage shifts, track hours, and publish schedules."
//               : "View your upcoming shifts."}
//           </p>
//         </div>
//         {isManagerOrAdmin && (
//           <button className="px-4 py-2 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600 shadow-sm">
//             Publish Week
//           </button>
//         )}
//       </div>

//       {/* THE FIX: The toolbar is now correctly structured for all roles */}
//       <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
//         <div
//           className={`grid grid-cols-1 ${
//             isManagerOrAdmin
//               ? "md:grid-cols-3 lg:grid-cols-5"
//               : "md:grid-cols-2"
//           } gap-4 items-center`}
//         >
//           <div className="flex items-center space-x-2">
//             <button
//               className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
//               onClick={handleToday}
//             >
//               Today
//             </button>
//             <button
//               className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
//               onClick={handlePrev}
//             >
//               ‹
//             </button>
//             <button
//               className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
//               onClick={handleNext}
//             >
//               ›
//             </button>
//           </div>
//           <select
//             value={currentView}
//             onChange={(e) => handleView(e.target.value as View | "custom")}
//             className="p-2 border border-gray-300 rounded-md"
//           >
//             <option value="day">Day</option>
//             <option value="week">Week</option>
//             <option value="month">Month</option>
//             <option value="custom">Custom</option>
//           </select>

//           {isManagerOrAdmin && (
//             <>
//               <select
//                 value={selectedUserId}
//                 onChange={(e) => setSelectedUserId(e.target.value)}
//                 className="p-2 border border-gray-300 rounded-md"
//               >
//                 <option value="all">All Staff ({totalHours} hrs)</option>
//                 {users.map((user) => (
//                   <option key={user.id} value={user.id}>
//                     {user.first_name} {user.last_name} (
//                     {((userHoursMap.get(user.id) || 0) / 60).toFixed(2)} hrs)
//                   </option>
//                 ))}
//               </select>
//               <div className="flex items-center gap-2">
//                 <label htmlFor="hour-budget" className="text-sm font-medium">
//                   Budget:
//                 </label>
//                 <input
//                   id="hour-budget"
//                   type="number"
//                   value={hourBudget}
//                   onChange={(e) => setHourBudget(Number(e.target.value))}
//                   className="w-20 p-2 border border-gray-300 rounded-md"
//                 />
//               </div>
//               <div
//                 className={`p-2 rounded-md text-center font-bold ${
//                   remainingHours < 0
//                     ? "bg-red-100 text-red-700"
//                     : "bg-green-100 text-green-700"
//                 }`}
//               >
//                 {remainingHours.toFixed(2)} hrs remaining
//               </div>
//             </>
//           )}
//         </div>
//         {currentView === "custom" && (
//           <div className="flex items-center gap-4 pt-4 border-t">
//             <label>From:</label>
//             <input
//               type="date"
//               value={format(customRange.start, "yyyy-MM-dd")}
//               onChange={(e) =>
//                 setCustomRange((prev) => ({
//                   ...prev,
//                   start: new Date(e.target.value),
//                 }))
//               }
//               className="p-2 border rounded-md"
//             />
//             <label>To:</label>
//             <input
//               type="date"
//               value={format(customRange.end, "yyyy-MM-dd")}
//               onChange={(e) =>
//                 setCustomRange((prev) => ({
//                   ...prev,
//                   end: new Date(e.target.value),
//                 }))
//               }
//               className="p-2 border rounded-md"
//             />
//           </div>
//         )}
//       </div>

//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <div className="h-[75vh]">
//           {loading ? (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-gray-500">Loading schedule...</p>
//             </div>
//           ) : error ? (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-red-600">{error}</p>
//             </div>
//           ) : (
//             <Calendar
//               localizer={localizer}
//               events={filteredShifts}
//               startAccessor="start"
//               endAccessor="end"
//               view={currentView === "custom" ? "week" : currentView}
//               date={currentDate}
//               onNavigate={handleNavigate}
//               onView={(v) => handleView(v)}
//               onDrillDown={handleDrillDown}
//               selectable={isManagerOrAdmin}
//               onSelectSlot={handleSelectSlot}
//               onSelectEvent={handleSelectEvent}
//               eventPropGetter={eventStyleGetter}
//               showMultiDayTimes
//               components={{
//                 toolbar: () => null,
//                 event: ShiftEvent,
//               }}
//             />
//           )}
//         </div>
//       </div>

//       {isAddModalOpen && selectedSlot && scheduleId && (
//         <AddShiftModal
//           isOpen={isAddModalOpen}
//           onClose={() => setIsAddModalOpen(false)}
//           onSave={fetchData}
//           users={users}
//           scheduleId={scheduleId}
//           slotInfo={selectedSlot}
//         />
//       )}
//       {isEditModalOpen && selectedShift && (
//         <EditShiftModal
//           isOpen={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           onSave={fetchData}
//           users={users}
//           shift={selectedShift}
//         />
//       )}
//     </div>
//   );
// };

// export default SchedulePage;

/* =================================================================
 * PATH: frontend-web/src/pages/SchedulePage.tsx
 * ================================================================= */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import type { SlotInfo, Event, View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";
import getDay from "date-fns/getDay";
import differenceInMinutes from "date-fns/differenceInMinutes";
import { enUS } from "date-fns/locale";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import addDays from "date-fns/addDays";
import subDays from "date-fns/subDays";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axiosClient from "../api/axiosClient";
import AddShiftModal from "../components/schedule/AddShiftModal";
import EditShiftModal from "../components/schedule/EditShiftModal";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// --- TYPE DEFINITIONS ---
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  schedule_color: string;
  role_name: string;
}

interface Shift extends Event {
  id: number;
  user_id: string;
  resource?: { color: string };
}

interface Schedule {
  id: number;
  week_start_date: string;
  is_published: boolean;
}

// --- CUSTOM COMPONENTS ---
const ShiftEvent: React.FC<{ event: Shift }> = ({ event }) => {
  return (
    <div className="h-full p-1 flex flex-col justify-start">
      <p className="font-semibold text-xs truncate">{event.title}</p>
      <p className="text-xs">{`${format(event.start as Date, "p")} - ${format(
        event.end as Date,
        "p"
      )}`}</p>
    </div>
  );
};

// --- MAIN SCHEDULE PAGE COMPONENT ---
const SchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View | "custom">(Views.WEEK);
  const [customRange, setCustomRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [hourBudget, setHourBudget] = useState(160);

  const currentUser: UserProfile = useMemo(
    () => JSON.parse(localStorage.getItem("user_profile") || "{}"),
    []
  );
  const isManagerOrAdmin = useMemo(
    () => ["Admin", "Manager"].includes(currentUser.role_name),
    [currentUser]
  );

  const dateRange = useMemo(() => {
    if (currentView === "custom")
      return {
        start: startOfDay(customRange.start),
        end: endOfDay(customRange.end),
      };
    if (currentView === Views.DAY)
      return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    if (currentView === Views.MONTH)
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    };
  }, [currentDate, currentView, customRange]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let usersData: UserProfile[];
      if (isManagerOrAdmin) {
        const usersResponse = await axiosClient.get("/users");
        usersData = usersResponse.data;
      } else {
        usersData = [currentUser];
      }
      setUsers(usersData);

      const weekStartDate = format(
        startOfWeek(currentDate, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      const scheduleResponse = await axiosClient.get(
        `/schedules/week/${weekStartDate}`
      );
      setSchedule(scheduleResponse.data.schedule);

      const shiftsResponse = await axiosClient.get("/schedules/shifts", {
        params: {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          weekStartDate: weekStartDate,
        },
      });

      const userMap = new Map(usersData.map((u: UserProfile) => [u.id, u]));
      const formattedShifts = shiftsResponse.data.map((shift: any) => {
        const user = userMap.get(shift.user_id);
        return {
          ...shift,
          start: new Date(shift.start_time),
          end: new Date(shift.end_time),
          title: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
          resource: { color: user?.schedule_color || "#E5E7EB" },
        };
      });
      setAllShifts(formattedShifts);
    } catch (err) {
      setError("Failed to fetch schedule data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, currentDate, isManagerOrAdmin, currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userHoursMap = useMemo(() => {
    const map = new Map<string, number>();
    allShifts.forEach((shift) => {
      const calcStart = Math.max(
        shift.start.getTime(),
        dateRange.start.getTime()
      );
      const calcEnd = Math.min(shift.end.getTime(), dateRange.end.getTime());
      if (calcEnd > calcStart) {
        const duration = differenceInMinutes(calcEnd, calcStart);
        const currentHours = map.get(shift.user_id) || 0;
        map.set(shift.user_id, currentHours + duration);
      }
    });
    return map;
  }, [allShifts, dateRange]);

  const filteredShifts = useMemo(() => {
    if (isManagerOrAdmin) {
      if (selectedUserId === "all") return allShifts;
      return allShifts.filter((shift) => shift.user_id === selectedUserId);
    }
    return allShifts.filter((shift) => shift.user_id === currentUser.id);
  }, [allShifts, selectedUserId, isManagerOrAdmin, currentUser.id]);

  const totalHours = useMemo(() => {
    const totalMinutes = filteredShifts.reduce((acc, shift) => {
      const duration = differenceInMinutes(
        shift.end as Date,
        shift.start as Date
      );
      return acc + duration;
    }, 0);
    return (totalMinutes / 60).toFixed(2);
  }, [filteredShifts]);

  const remainingHours = useMemo(
    () => hourBudget - parseFloat(totalHours),
    [hourBudget, totalHours]
  );

  const handlePrev = () => {
    let newDate;
    if (currentView === "day") newDate = subDays(currentDate, 1);
    else if (currentView === "month") newDate = subMonths(currentDate, 1);
    else newDate = subDays(currentDate, 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    let newDate;
    if (currentView === "day") newDate = addDays(currentDate, 1);
    else if (currentView === "month") newDate = addMonths(currentDate, 1);
    else newDate = addDays(currentDate, 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());
  const handleView = (view: View | "custom") => setCurrentView(view);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!isManagerOrAdmin) return;
    // For published weeks, prevent creating shifts in the past. Drafts can be edited freely.
    if (schedule?.is_published && new Date(slotInfo.start) < new Date()) return;
    setSelectedSlot(slotInfo);
    setIsAddModalOpen(true);
  };

  const handleSelectEvent = (event: Shift) => {
    if (!isManagerOrAdmin) return;
    // For published weeks, prevent editing past/ongoing shifts.
    if (schedule?.is_published && new Date(event.start as Date) < new Date())
      return;
    setSelectedShift(event);
    setIsEditModalOpen(true);
  };

  const eventStyleGetter = (event: Shift) => {
    const isPast = new Date(event.start as Date) < new Date();
    const isPublished = schedule?.is_published || false;
    const isLocked = isPast && isPublished;

    const style = {
      backgroundColor: event.resource?.color || "#E5E7EB",
      borderRadius: "5px",
      opacity: isLocked ? 0.6 : 0.9,
      color: "#1F2937",
      border: "1px solid #9CA3AF",
      display: "block",
      cursor: isLocked && isManagerOrAdmin ? "not-allowed" : "pointer",
    };
    return { style };
  };

  const handleNavigate = (newDate: Date) => setCurrentDate(newDate);
  const handleDrillDown = (newDate: Date) => {
    setCurrentView("day");
    setCurrentDate(newDate);
  };

  const handlePublishToggle = async () => {
    if (!schedule) return;
    try {
      const newStatus = !schedule.is_published;
      const response = await axiosClient.patch(
        `/schedules/${schedule.id}/publish`,
        {
          is_published: newStatus,
        }
      );
      setSchedule(response.data);
      fetchData();
    } catch (error: any) {
      alert(
        `Error: ${error.response?.data?.error || "Could not update status."}`
      );
    }
  };

  const isWeekInPast = useMemo(() => {
    if (!schedule) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(schedule.week_start_date) < today;
  }, [schedule]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Schedule
          </h1>
          <p className="text-sm text-gray-500">
            {isManagerOrAdmin ? "Total Hours Scheduled:" : "Your Total Hours:"}
            <span className="font-bold text-indigo-600"> {totalHours}</span>
          </p>
        </div>
        {isManagerOrAdmin && (
          <button
            onClick={handlePublishToggle}
            disabled={isWeekInPast && schedule?.is_published}
            className={`px-4 py-2 rounded-md font-semibold text-white shadow-sm transition-colors ${
              schedule?.is_published
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 hover:bg-gray-600"
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {schedule?.is_published ? "✓ Published" : "Publish Week"}
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div
          className={`grid grid-cols-1 ${
            isManagerOrAdmin
              ? "md:grid-cols-3 lg:grid-cols-5"
              : "md:grid-cols-2"
          } gap-4 items-center`}
        >
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={handleToday}
            >
              Today
            </button>
            <button
              className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={handlePrev}
            >
              ‹
            </button>
            <button
              className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={handleNext}
            >
              ›
            </button>
          </div>
          <select
            value={currentView}
            onChange={(e) => handleView(e.target.value as View | "custom")}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="custom">Custom</option>
          </select>

          {isManagerOrAdmin && (
            <>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Staff ({totalHours} hrs)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} (
                    {((userHoursMap.get(user.id) || 0) / 60).toFixed(2)} hrs)
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <label htmlFor="hour-budget" className="text-sm font-medium">
                  Budget:
                </label>
                <input
                  id="hour-budget"
                  type="number"
                  value={hourBudget}
                  onChange={(e) => setHourBudget(Number(e.target.value))}
                  className="w-20 p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div
                className={`p-2 rounded-md text-center font-bold ${
                  remainingHours < 0
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {remainingHours.toFixed(2)} hrs remaining
              </div>
            </>
          )}
        </div>
        {currentView === "custom" && (
          <div className="flex items-center gap-4 pt-4 border-t">
            <label>From:</label>
            <input
              type="date"
              value={format(customRange.start, "yyyy-MM-dd")}
              onChange={(e) =>
                setCustomRange((prev) => ({
                  ...prev,
                  start: new Date(e.target.value),
                }))
              }
              className="p-2 border rounded-md"
            />
            <label>To:</label>
            <input
              type="date"
              value={format(customRange.end, "yyyy-MM-dd")}
              onChange={(e) =>
                setCustomRange((prev) => ({
                  ...prev,
                  end: new Date(e.target.value),
                }))
              }
              className="p-2 border rounded-md"
            />
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="h-[75vh]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading schedule...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={filteredShifts}
              startAccessor="start"
              endAccessor="end"
              view={currentView === "custom" ? "week" : currentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={(v) => handleView(v)}
              onDrillDown={handleNavigate}
              selectable={isManagerOrAdmin}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              showMultiDayTimes
              components={{
                toolbar: () => null,
                event: ShiftEvent,
              }}
            />
          )}
        </div>
      </div>

      {isManagerOrAdmin && isAddModalOpen && selectedSlot && schedule?.id && (
        <AddShiftModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetchData}
          users={users}
          scheduleId={schedule.id}
          slotInfo={selectedSlot}
        />
      )}
      {isManagerOrAdmin && isEditModalOpen && selectedShift && (
        <EditShiftModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={fetchData}
          users={users}
          shift={selectedShift}
        />
      )}
    </div>
  );
};

export default SchedulePage;
