export const CustomTooltip = ({ active, payload }: any) => {
  // const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div
        className="bg-gray-200
          min-w-[90px]
          px-2 py-1
          rounded-md
          border
          text-xs
          font-medium 
          flex flex-col
          items-center
          text-center
          whitespace-nowrap
          pointer-events-none"
      >
        <span className="whitespace-nowrap">
          {payload[0].name}: {payload[0].value}
        </span>
      </div>
    );
  }
  return null;
};

//  <CardContent className="flex items-center gap-4">
//       <div className="relative h-[220px] w-[220px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={capacityData}
//               cx="50%"
//               cy="50%"
//               innerRadius="35%" // pehle 55% tha
//               outerRadius="90%"
//               dataKey="value"
//               startAngle={90}
//               endAngle={-270}
//             >
//               {capacityData.map((_, index) => (
//                 <Cell key={index} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>

//             <Tooltip content={<CustomTooltip />} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </CardContent>
