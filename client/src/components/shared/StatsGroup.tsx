import React from "react";

export interface StatItem {
  label: string;
  value: string | number;
}

interface StatsGroupProps {
  stats: StatItem[];
}

const StatsGroup: React.FC<StatsGroupProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const imagesPerItem = index === 0 ? 1 : 2;

        const imageSrcs: string[] =
          imagesPerItem === 1
            ? ["/assets/dashboard/rack/Frame2.svg"]
            : ["/assets/dashboard/rack/Frame1.svg"];

        return (
          <div
            key={index}
            className={`relative  flex gap-2 items-center justify-center ${
              imagesPerItem === 1 ? "flex-col" : "flex-row"
            }`}
          >
            {imageSrcs.map((src, i) => (
              <div
                key={i}
                className="relative w-full max-w-[260px] aspect-[3/1]"
              >
                <img
                  src={src}
                  alt={stat.label}
                  className="w-full h-full object-contain"
                />

                {/* Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight px-1">
                  <span className="text-[#475467] font-bold text-xl">
                    {stat.value}
                  </span>
                  <span className="text-sm text-[#667085] text-center">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default StatsGroup;
