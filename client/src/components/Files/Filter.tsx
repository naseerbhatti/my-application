import { useState } from "react";
import CustomCalendar from "./DateRange";

const houses = ["CBC House", "Club House"];
const racks = ["14", "12"];
const shelves = ["01", "02"];

const sortOptions = [
  { key: "issueFiles", label: "Issue Files" },
  { key: "withoutSlip", label: "Without Slip", indent: true },
  { key: "returnFiles", label: "Return Files" },
  { key: "missingFiles", label: "Missing Files" },
];

export const FilerModal = ({ onClose }: { onClose: () => void }) => {
  const defaultState = {
    startDate: "2025-04-27",
    endDate: "2025-04-30",
    houses: houses[0],
    racks: racks[1],
    shelf: shelves[1],
    sort: Object.fromEntries(sortOptions.map((s) => [s.key, false])),
  };

  const [form, setForm] = useState(defaultState);

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSortChange = (key: string) =>
    setForm((prev) => ({
      ...prev,
      sort: { ...prev.sort, [key]: !prev.sort[key] },
    }));

  const resetForm = () => setForm(defaultState);

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
  <div className="relative w-full max-w-5xl bg-white  shadow-lg p-6">

    {/*  Close */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
    >
      ✕
    </button>

    <h2 className="text-lg font-semibold mb-6">Filters</h2>
    <h2>Calender</h2>

    {/* MAIN GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* LEFT SIDE */}
      <div className="flex flex-col gap-4">

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         
          <CustomCalendar/>

          
        </div>

        {/* Calendar Placeholder */}
       
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col gap-4">

        {/* Dropdowns */}
        <select
          value={form.houses}
          onChange={(e) => handleChange("house", e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          {houses.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>

        <select
          value={form.racks}
          onChange={(e) => handleChange("rack", e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          {racks.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <select
          value={form.shelf}
          onChange={(e) => handleChange("shelf", e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          {shelves.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* SORT */}
        <div>
          <h3 className="text-sm font-medium mb-2">SORT BY</h3>
          <div className="flex flex-col gap-2 text-sm">
            {sortOptions.map((s) => (
              <label
                key={s.key}
                className={`flex items-center gap-2 ${
                  s.indent ? "ml-5" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.sort[s.key]}
                  onChange={() => handleSortChange(s.key)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ACTIONS */}
    <div className="flex justify-end gap-4 mt-6">
      <button
        onClick={resetForm}
        className="px-4 py-2 border rounded-lg text-gray-700"
      >
        Reset
      </button>
      <button className="px-6 py-2 bg-[#047857] text-white rounded-lg">
        Apply
      </button>
    </div>
  </div>
</div>

  );
};
