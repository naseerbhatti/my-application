import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useApiGetRackByIdQuery } from "@/src/redux/api";
import { Card } from "@/src/components/ui/card";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import ShelfCard from "@/src/components/rackmanagment/ShelfCard";
import { ShelfCardSkeleton } from "@/src/components/Skeleton/ShelfCardSkeleton";
// import ViewShlefCard from "@/src/components/rackmanagment/ViewShlefCard";

function RackDetails() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useApiGetRackByIdQuery(id!);

  const rack = data?.data || data;

  const shelves =
    rack?.shelves?.length > 0
      ? rack.shelves
      : Array.from({ length: rack?.total_shelf || 0 }, (_, i) => ({
          _id: `${rack._id}`,
          number: i + 1,
        }));

  return (
    <div className="p-2 space-y-3">
      <div className="px-9 lg:px-0">
        <BreadcrumbNav
          items={[
            { title: "Racks", href: "/rack-management" },
            { title: `Rack ${rack?.number}` },
          ]}
        />
      </div>
      {/* Rack Card */}
      <Card className="border-none rounded-md shadow-none overflow-hidden">
        {/* Shelves Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
          {shelves.map((shelf: any) =>
            isLoading ? (
              <ShelfCardSkeleton key={shelf._id} />
            ) : (
              <ShelfCard key={shelf._id} shelf={shelf} />
            )
          )}
        </div>

      </Card>
    </div>
  );
}

export default RackDetails;
