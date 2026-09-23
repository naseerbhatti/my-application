import { useState, useRef, useEffect } from "react";

interface Day {
  date: Date;
  currentMonth: boolean;
}

const getMonthDays = (month: number, year: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Day[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: new Date(year, month, 0), currentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
  }
  return days;
};

const CustomCalendar = () => {
  const today = new Date();
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [openCalendar, setOpenCalendar] = useState<"start" | "end" | null>(null);

  const [currentMonthStart, setCurrentMonthStart] = useState(today.getMonth());
  const [currentYearStart, setCurrentYearStart] = useState(today.getFullYear());

  const [currentMonthEnd, setCurrentMonthEnd] = useState(today.getMonth());
  const [currentYearEnd, setCurrentYearEnd] = useState(today.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenCalendar(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectDate = (type: "start" | "end", date: Date) => {
    if (type === "start") {
      setStart(date);
    } else {
      setEnd(date);
    }
    setOpenCalendar(null);
  };

  const isActive = (date: Date) => {
    if (!start) return false;
    if (start && !end) return date.toDateString() === start.toDateString();
    return start && end && date >= start && date <= end;
  };

  const renderCalendar = (type: "start" | "end") => {
    const month = type === "start" ? currentMonthStart : currentMonthEnd;
    const year = type === "start" ? currentYearStart : currentYearEnd;
    const days = getMonthDays(month, year);

    const prevMonth = () => {
      if (type === "start") {
        if (currentMonthStart === 0) { setCurrentMonthStart(11); setCurrentYearStart(currentYearStart - 1); }
        else setCurrentMonthStart(currentMonthStart - 1);
      } else {
        if (currentMonthEnd === 0) { setCurrentMonthEnd(11); setCurrentYearEnd(currentYearEnd - 1); }
        else setCurrentMonthEnd(currentMonthEnd - 1);
      }
    };

    const nextMonth = () => {
      if (type === "start") {
        if (currentMonthStart === 11) { setCurrentMonthStart(0); setCurrentYearStart(currentYearStart + 1); }
        else setCurrentMonthStart(currentMonthStart + 1);
      } else {
        if (currentMonthEnd === 11) { setCurrentMonthEnd(0); setCurrentYearEnd(currentYearEnd + 1); }
        else setCurrentMonthEnd(currentMonthEnd + 1);
      }
    };

    return (
      <div className="border rounded-lg p-3 w-64 mt-2 bg-white shadow-lg z-50 absolute">
        <div className="flex justify-between items-center mb-2">
          <button onClick={prevMonth} className="px-2 py-1 rounded bg-gray-200">&lt;</button>
          <span className="font-semibold">{months[month]} {year}</span>
          <button onClick={nextMonth} className="px-2 py-1 rounded bg-gray-200">&gt;</button>
        </div>

        <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => selectDate(type, day.date)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                ${!day.currentMonth ? "text-gray-300" : ""}
                ${isActive(day.date) ? "bg-green-500 text-white" : "hover:bg-gray-100"}`}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Inputs */}
      <div className="flex gap-2">
        <input
          readOnly
          placeholder="Start Date"
          value={start ? start.toDateString() : ""}
          onClick={() => setOpenCalendar("start")}
          className="w-48 border rounded-lg px-3 py-2 cursor-pointer"
        />
        <input
          readOnly
          placeholder="End Date"
          value={end ? end.toDateString() : ""}
          onClick={() => setOpenCalendar("end")}
          className="w-48 border rounded-lg px-3 py-2 cursor-pointer"
        />
      </div>

      {/* Calendar */}
      {openCalendar === "start" && renderCalendar("start")}
      {openCalendar === "end" && renderCalendar("end")}
    </div>
  );
};

export default CustomCalendar;
