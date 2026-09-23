import React from "react";
import { Card, CardContent } from "../ui/card";

interface StatsCardProps {
  label: string;
  value: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value }) => {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-6 text-center">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );
};
