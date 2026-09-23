import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Eye,
  Pencil,
  ChevronLeft,
  MoveUpRight,
  MoveDownLeft,
} from "lucide-react";

interface File {
  _id: string;
  number: string;
  applicant: string;
  shelf: {
    _id: string;
    number: number;
    rack: {
      _id: string;
      number: number;
      room: {
        _id: string;
        number: number;
        house: {
          _id: string;
          name: string;
        };
      };
    };
  };
  status: "issued" | "returned" | "missing";
  createdAt: string;
  description?: string;
}

const files = [
  {
    id: "SBCA-2023-889",
    plot: "Plot A-21, Gulshan",
    applicant: "Faisal",
    rack: "R-01",
    shelf: "S-05",
    issueDate: "12-03-2026",
    status: "Available",
  },
  {
    id: "SBCA-2023-889",
    plot: "Plot A-21, Gulshan",
    applicant: "Ahmed",
    rack: "R-01",
    shelf: null,
    issueDate: "12-03-2026",
    status: "issued",
  },
];

export function FilesTable() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Issued
          </Badge>
        );
      case "Available":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Available
          </Badge>
        );
      case "missing":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Missing
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  const formatLocation = (file: File) => {
    if (!file.shelf) return "N/A";
    const room = file.shelf.rack?.room?.number || "?";
    const rack = file.shelf.rack?.number || "?";
    const shelf = file.shelf.number || "?";
    return (
      <div className="flex gap-1">
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          R-{room}
        </Badge>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          S-{shelf}
        </Badge>
      </div>
    );
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>FILE NO.</TableHead>
            <TableHead>APPLICANT</TableHead>
            <TableHead>LOCATION</TableHead>
            <TableHead>ISSUE DATE</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={index}>
              <TableCell>
                <div>
                  <p className="font-medium text-[#0F172A]">{file.id}</p>
                  <p className="text-xs text-[#64748B]">{file.plot}</p>
                </div>
              </TableCell>
              <TableCell className="text-[#475569] ">
                {file.applicant}
              </TableCell>
              <Badge className="bg-[#dcfce7]  h-7 text-[#16a34a]  text-xs">
                {file.rack}
              </Badge>
              {file.shelf && (
                <Badge className="bg-[#dcfce7]  h-7 text-[#16a34a]  text-xs">
                  {file.shelf}
                </Badge>
              )}

              <TableCell>{file.issueDate}</TableCell>
              <TableCell>{getStatusBadge(file.status)}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {/* <ChevronLeft className="h-4 w-4" /> */}
                    {file.status === "Available" && <MoveUpRight />}
                    {file.status === "issued" && <MoveDownLeft />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
