import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useState } from "react";

const COLORS = ["#047857", "#FEC678", "#D1D5DB", "#000000"];
const BORDER_COLORS = ["#065f46", "#f59e0b", "#9ca3af"];

export function RackCapacityChart({ capacityData }: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <Card className="border  rounded-md shadow-none bg-white border-gray-200 ">
      <CardHeader className="">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base text-[#111827] font-medium">
            Overall
          </CardTitle>

          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {new Date().toLocaleString("default", { month: "long" })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center items-center gap-4">
        {/* Chart */}
        <div className="relative h-[231px] w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={capacityData}
                cx="50%"
                cy="50%"
                innerRadius={53}
                outerRadius={110}
                dataKey="value"
                endAngle={450}
              >
                {capacityData.map(
                  (entry: { name: string; value: number }, index: number) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                      stroke={
                        hoveredIndex === index
                          ? BORDER_COLORS[index]
                          : "transparent"
                      }
                      strokeWidth={hoveredIndex === index ? 2 : 0}
                      style={{
                        cursor: "pointer",
                        transition: "stroke 0.3s ease-in-out",
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  ),
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
                labelStyle={{
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#111827",
                }}
                itemStyle={{
                  padding: "2px 0",
                  color: "#374151",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      {/* Legend */}
      <div className="flex justify-start   items-start  px-4  gap-2 pb-4 md:pl-6 text-xs">
        <div className="flex  items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#047857]" />
          <span className="text-muted-foreground">Total</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEC678]" />
          <span className="text-muted-foreground">Issued</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB]" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#000000]" />
          <span className="text-muted-foreground">Missing</span>
        </div>
      </div>
    </Card>
  );
}
