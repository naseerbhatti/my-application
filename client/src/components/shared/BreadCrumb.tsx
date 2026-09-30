import { ChevronRight, Home } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";

export const BreadcrumbNav = ({ items }: any) => {
  const location = useLocation();
  return (
    <Breadcrumb>
      <BreadcrumbList className="pt-2 flex items-center gap-1">
        {/* Home Icon */}

        {items.map((item: any, index: number) => (
          <React.Fragment key={index}>
            {index !== 0 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </BreadcrumbSeparator>
            )}

            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.href}
                    className={
                      location.pathname === item.href
                        ? "font-semibold text-gray-900"
                        : "text-gray-600 hover:text-gray-800"
                    }
                  >
                    {item.title}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink className="font-semibold text-gray-900">
                  {item.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
