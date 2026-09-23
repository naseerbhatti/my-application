import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useEffect, useState } from "react";

export function FilesTrendChart({ formattedDated }: any) {
  const [chartdata, setChartData] = useState<any[]>([]);
  const [hoveredBar, setHoveredBar] = useState<{
    type: string;
    index: number;
  } | null>(null);

  const createDummyData = () => [
    { day: "Mon", newFiles: 0, issued: 0, returned: 0 },
    { day: "Tue", newFiles: 0, issued: 0, returned: 0 },
    { day: "Wed", newFiles: 0, issued: 0, returned: 0 },
    { day: "Thu", newFiles: 0, issued: 0, returned: 0 },
    { day: "Fri", newFiles: 0, issued: 0, returned: 0 },
    { day: "Sat", newFiles: 0, issued: 0, returned: 0 },
    { day: "Sun", newFiles: 0, issued: 0, returned: 0 },
  ];

  useEffect(() => {
    if (!formattedDated || formattedDated.length === 0) {
      setChartData(createDummyData());
      return;
    }
    setChartData(formattedDated);
  }, [formattedDated]);

  return (
    <Card className="border p-3 rounded-md shadow-none bg-white border-gray-200 w-full">
      <CardHeader className="">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base text-[#111827] font-medium">
            District /Section Wise Trend
          </CardTitle>

          <div className="flex items-center gap-3 text-xs">
            <LegendDot color="#047857" label="New Files" />
            <LegendDot color="#FEC678" label="Issued" />
            <LegendDot color="#D1D5DB" label="Returned" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartdata}
              barGap={3}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />

              <YAxis hide domain={[0, "dataMax + 1"]} />

              <Tooltip
                cursor={{ fill: "transparent" }}
                shared={false}
                animationDuration={200}
                animationEasing="ease-out"
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

              <Bar
                dataKey="newFiles"
                fill="#047857"
                barSize={9}
                radius={[3, 3, 0, 0]}
                minPointSize={2}
                shape={(props: any) =>
                  renderBarShape(
                    props,
                    hoveredBar,
                    setHoveredBar,
                    "newFiles",
                    "#065f46",
                  )
                }
              />

              <Bar
                dataKey="issued"
                fill="#FEC678"
                barSize={9}
                radius={[3, 3, 0, 0]}
                minPointSize={2}
                shape={(props: any) =>
                  renderBarShape(
                    props,
                    hoveredBar,
                    setHoveredBar,
                    "issued",
                    "#f59e0b",
                  )
                }
              />

              <Bar
                dataKey="returned"
                fill="#D1D5DB"
                barSize={9}
                radius={[3, 3, 0, 0]}
                minPointSize={2}
                shape={(props: any) =>
                  renderBarShape(
                    props,
                    hoveredBar,
                    setHoveredBar,
                    "returned",
                    "#9ca3af",
                  )
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Helpers ---------- */

function LegendDot({ color, label }: any) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function renderBarShape(
  props: any,
  hoveredBar: any,
  setHoveredBar: any,
  type: string,
  strokeColor: string,
) {
  const isHovered =
    hoveredBar?.type === type && hoveredBar?.index === props.index;

  return (
    <rect
      {...props}
      rx={3}
      ry={3}
      stroke={isHovered ? strokeColor : "transparent"}
      strokeWidth={2}
      style={{
        transition: "stroke 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHoveredBar({ type, index: props.index })}
      onMouseLeave={() => setHoveredBar(null)}
    />
  );
}
