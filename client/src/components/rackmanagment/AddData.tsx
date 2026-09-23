import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { AddRoomDialog } from "./AddRoomDialog";
import { AddRackDialog } from "./AddRackDialog";
import AddShelfDialogs from "./AddShelfDialogs";
import { AddHouseDialog } from "./AddHouseDialog";
import { can } from "@/src/utils/permisson";
import { useState } from "react";

type TabType = "house" | "room" | "rack" | "shelf";

export function AddDataDialog({ open, onOpenChange, user }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("rack");

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="w-[95vw] max-w-xl rounded-md p-4 sm:p-6">
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabType)}
      className="w-full flex flex-col pt-2"
    >
      {/* Mobile: tabs wrap & scroll horizontally if needed */}
      <TabsList className="flex flex-row w-full overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap gap-1">
        {can(user.permissions, "HOUSE", "WRITE") && (
          <TabsTrigger
            value="house"
            className="flex-1 min-w-[70px] text-sm data-[state=active]:bg-[#047857] data-[state=active]:text-white rounded-md"
          >
            Building
          </TabsTrigger>
        )}
        {can(user.permissions, "ROOM", "WRITE") && (
          <TabsTrigger
            value="room"
            className="flex-1 min-w-[70px] text-sm data-[state=active]:bg-[#047857] data-[state=active]:text-white rounded-md"
          >
            Room
          </TabsTrigger>
        )}
        {can(user.permissions, "RACK", "WRITE") && (
          <TabsTrigger
            value="rack"
            className="flex-1 min-w-[70px] text-sm data-[state=active]:bg-[#047857] data-[state=active]:text-white rounded-md"
          >
            Rack
          </TabsTrigger>
        )}
        {can(user.permissions, "SHELF", "WRITE") && (
          <TabsTrigger
            value="shelf"
            className="flex-1 min-w-[70px] text-sm data-[state=active]:bg-[#047857] data-[state=active]:text-white rounded-md"
          >
            Shelf
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="house" className="mt-4 w-full">
        <AddHouseDialog onClose={onOpenChange} />
      </TabsContent>

      <TabsContent value="room" className="mt-4 w-full">
        <AddRoomDialog onClose={onOpenChange} />
      </TabsContent>

      <TabsContent value="rack" className="mt-4 w-full">
        <AddRackDialog onClose={onOpenChange} />
      </TabsContent>

      <TabsContent value="shelf" className="mt-4 w-full">
        <AddShelfDialogs onClose={onOpenChange} />
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
  );
}
