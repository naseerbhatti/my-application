import React, { useState } from "react";
import {FilerModal} from '../Files/Filter'

export const FileSearch = () => {

  const [openFilter, setOpenFilter] = useState(false)
    
  return (  
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Input */}
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search file..."
          className="w-full px-10  py-2 rounded-lg border border-gray-300 "
        />
        <img
          src="/assets/dashboard/File/SVG.png"
          alt="search"
          className="absolute left-3  top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
        />
      </div>

      {/* Filter Button */}
      <button onClick={() => setOpenFilter(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border  border-[#0AC28E] transition">
        {/* <FilerModal/> */}
        <img
          src="/assets/dashboard/File/filter1.png"
          alt="filter"
          className="w-4 h-4"
        />
        <span className="text-[#0AC28E]">Filter</span>
      </button>

      {openFilter && <FilerModal onClose= {() => setOpenFilter(false)}/>}

      {/* Export */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-[#334155] transition">
        <img
          src="/assets/dashboard/File/Group.png"
          alt="export"
          className="w-4 h-4"
        />
        <span>Export Report</span>
      </button>

      {/* File Track */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-[#047857] text-white transition">
        <span>File Track</span>
      </button>
    </div>
  );
};
