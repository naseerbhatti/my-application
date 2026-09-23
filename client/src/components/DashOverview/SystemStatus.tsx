"use client";

import { StatsCards } from "./StatsCards";
import { FilesTable } from "./FilesTable";
import { ChevronDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { FilesTrendChart } from "../dashboard/FilesTrendChart";
import { RackCapacityChart } from "../dashboard/RackCapacityChart";

export function SystemStatus() {
  return (
    <div className="max-w-7xl   mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            System Status
          </h1>
          <p className="text-[#64748B] text-md md:mt-1   ">
            Real-time overview of SBCA record management System.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 md:mb-1  rounded-full bg-background"
        >
          March 2025
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FilesTrendChart />
        </div>
        <div>
          <RackCapacityChart />
        </div>
      </div>

      {/* Files Table */}
      <FilesTable />
    </div>
  );
}
