import { Card } from "@/src/components/ui/card"
import { FileText } from "lucide-react"

const stats = [
  { label: "Total Files", value: 800 },
  { label: "Issue Files", value: 100 },
  { label: "Issue Files", value: 100 },
  { label: "Issue Files", value: 100 },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2  md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="p-4 text-[#64748B]   flex justify-center items-center gap-4 "
        >
          
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
