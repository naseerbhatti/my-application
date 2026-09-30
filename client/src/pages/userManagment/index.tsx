import React, { useState } from "react";
import {
  useApiGetAllUsersQuery,
  useApiDeleteUserMutation,
  useApiGetAllFilesQuery,
} from "../../redux/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, Eye, Plus, Pencil, Trash, ListFilter } from "lucide-react";
import StatsGroup from "@/src/components/shared/StatsGroup";
import CustomTable from "@/src/components/shared/CustomTable";
import { AddUserDialog } from "@/src/components/userManagment/addUser";
import { ViewUserDialog } from "@/src/components/userManagment/viewUser";
import { EditUser } from "@/src/components/userManagment/EditUser";
import { showToast } from "@/src/utils/toast";
import { FilterUser } from "@/src/components/userManagment/filterUser";
import { BreadcrumbNav } from "@/src/components/shared/BreadCrumb";
import StatusBadge from "@/src/components/shared/StatusBadge";
import DeleteUserAlert from "@/src/components/userManagment/deleteUser";
import { can } from "@/src/utils/permisson";
import { useSelector } from "react-redux";
import StatsGroupSkeleton from "@/src/components/Skeleton/StatsGroupSkeleton";
import { CustomTableSkeleton } from "@/src/components/Skeleton/CustomTableSkeleton";
import { useDebounce } from "@/src/hooks/index";

interface User {
  _id: string;
  name: string;
  email: string;
  cnic: string;
  role: string;
  contact_number: string;
  designation?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

function UserManagment() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confrim, setConfrim] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const { user } = useSelector((state: any) => state.auth);
  const permissions = user?.permissions || {};
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterrUser, setFilterrUser] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error } = useApiGetAllUsersQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    search: debouncedSearch,
    page,
    limit: 10,
  });
  const [deleteUser] = useApiDeleteUserMutation();

  const users = (data?.data.users || []).filter((u: User) => {
    // 1. Hide current logged-in user
    if (u._id === user?._id) return false;

    // 2. Super Admin → sab dikhe (except himself)
    if (user?.role === "super_admin") {
      return true;
    }

    // 3. Admin → sirf super_admin hide
    if (user?.role === "admin") {
      return u.role !== "super_admin";
    }

    return true;
  });

  const totalPages = data?.data.pagination?.pages || 1;

  const statistics = data?.data.statistics;

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap();
      showToast("User deleted successfully", "success");
      setDeleteUserId(null);
      setConfrim(false);
    } catch (err: any) {
      showToast(err?.data?.message || "Failed to  delete user", "error");
    } finally {
      setConfrim(false);
    }
  };

  const handleApplyFilters = ({
    role,
    status,
  }: {
    role: string;
    status: string;
  }) => {
    setRoleFilter(role);
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="p-2 space-y-3   ">
      <div className="px-9 lg:px-0">
        <BreadcrumbNav items={[{ title: "Users" }]} />
      </div>
      {isLoading ? (
        <StatsGroupSkeleton />
      ) : (
        <StatsGroup
          stats={[
            {
              label: "Total Users",
              value: statistics?.total || 0,
            },
            {
              label: "Record Keepers",
              value: statistics?.totalRoleKeeper || 0,
            },
            {
              label: "Active Users",
              value: statistics?.totalActive || 0,
            },
            {
              label: "InActive Users",
              value: statistics?.totalInactive || 0,
            },
          ]}
        />
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-3 w-full md:flex-1">
          <div className="relative w-full md:max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="pl-10 py-4 w-full border border-gray-200 shadow-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            onClick={() => setFilterrUser(true)}
            variant="outline"
            className="w-full sm:w-auto shadow-none border border-gray-200 gap-2"
          >
            <ListFilter />
            Filter
          </Button>

          {can(permissions, "USER", "WRITE") && (
            <Button
              className="w-full sm:w-auto gap-2 bg-[#047857] hover:bg-[#065f46] text-white"
              onClick={() => setShowAddUser(true)}
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Table */}

      {isLoading ? (
        <CustomTableSkeleton
          columns={[
            { key: "name", label: "Name" },
            { key: "designation", label: "Designation" },
            { key: "status", label: "Status" },
            { key: "addFile", label: "Add File" },
          ]}
          rows={4}
        />
      ) : (
        <CustomTable
          columns={[
            {
              key: "name",
              label: "Name",
              render: (user: User) => (
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-medium  ">
                      {/* {user.name.toUpperCase()} */}
                      {user?.name
                        ?.split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "designation",
              label: "Designation",
              render: (user: User) => user.designation || user.role,
            },
            {
              key: "status",
              label: "Status",
              render: (user: User) => <StatusBadge status={user.status} />,
            },
            {
              key: "actions",
              label: "Action",
              className: "text-center",
              render: (user: User) => (
                <div className="flex items-center justify-end gap-1">
                  {/* VIEW USER */}
                  {can(permissions, "USER", "READ") && (
                    <Button
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setShowUser(true);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-gray-500 hover:text-gray-700"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* EDIT USER */}
                  {can(permissions, "USER", "UPDATE") && (
                    <Button
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setEditUser(true);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-gray-500 hover:text-gray-700"
                      title="Edit User"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  {/* DELETE USER */}
                  {can(permissions, "USER", "DELETE") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-gray-500 hover:text-red-600"
                      onClick={() => {
                        setDeleteUserId(user._id);
                        setConfrim(true);
                      }}
                      title="Delete User"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={users}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage={error ? "Error loading users" : "No users found"}
        />
      )}

      {/* Stats Footer */}

      {!isLoading && !error && users.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {users.length} of {users.length} staff members
        </div>
      )}
      <AddUserDialog open={showAddUser} onOpenChange={setShowAddUser} />
      <ViewUserDialog
        open={showUser}
        onOpenChange={setShowUser}
        userId={selectedUserId!}
      />

      <EditUser
        open={editUser}
        onOpenChange={setEditUser}
        userId={selectedUserId!}
      />

      <FilterUser
        open={filterrUser}
        onOpenChange={setFilterrUser}
        users={users}
        allUsers={users || []}
        onApply={handleApplyFilters}
      />
      <DeleteUserAlert
        open={confrim}
        setOpen={setConfrim}
        onDelete={() => deleteUserId && handleDelete(deleteUserId)}
      />
    </div>
  );
}
export default UserManagment;
