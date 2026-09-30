import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Server } from "../../constants/config";
import { AuthResponse, LoginRequest } from "../types";
import { removeUser, setUser } from "../reducers/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: Server,
  credentials: "include", // always include cookies

  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    const token = (getState() as any).auth?.accessToken;

    // Fallback to localStorage if not in Redux state
    const storageToken = !token ? localStorage.getItem("auth__token") : null;
    const authToken = token || storageToken;

    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Auth",
    "User",
    "Profile",
    "House",
    "Room",
    "Rack",
    "Shelf",
    "File",
    "FileTransaction",
  ],
  endpoints: (builder) => ({
    // ==================== AUTH ENDPOINTS ====================
    ApiSendOtp: builder.mutation<any, { phone: string; name?: string }>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    ApiLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // Persist auth for future sessions
          localStorage.setItem("auth__token", data.data.token);
          localStorage.setItem("auth__user", JSON.stringify(data.data.user));
          const user = data.data.user;
          dispatch(
            setUser({
              accessToken: data.data.token,
              user: {
                id: (user as any)._id ?? (user as any).id,
                name: user.name,
                email: user.email,
                role: user.role as any,
                avatar: (user as any).avatar,
                status: (user as any).status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              },
            }),
          );
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
      invalidatesTags: ["Auth"],
    }),
    ApiGet: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    ApiGetMe: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setUser({
              user: {
                id: (data.data.user as any)._id ?? (data.data.user as any).id,
                name: data.data.user.name,
                email: data.data.user.email,
                role: data.data.user.role as any,
                avatar: (data.data.user as any).avatar,
                status: (data.data.user as any).status,
                createdAt: data.data.user.createdAt,
                updatedAt: data.data.user.updatedAt,
              },
            }),
          );
        } catch (error) {
          console.error("Fetch user failed:", error);
          dispatch(removeUser());
        }
      },
      providesTags: ["Auth"],
    }),

    // ==================== HOUSE ENDPOINTS ====================
    ApiAddHouse: builder.mutation<any, { name: string; address: string }>({
      query: (body) => ({
        url: "/house/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["House"],
    }),
    ApiGetAllHouses: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/house?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["House"],
    }),
    ApiGetHouseById: builder.query<any, string>({
      query: (id) => ({
        url: `/house/${id}`,
        method: "GET",
      }),
      providesTags: ["House"],
    }),
    ApiUpdateHouse: builder.mutation<
      any,
      {
        id: string;
        data: Partial<{
          name: string;
          address: string;
          location: { lat: number; long: number };
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/house/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["House"],
    }),
    ApiDeleteHouse: builder.mutation<any, string>({
      query: (id) => ({
        url: `/house/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["House"],
    }),

    // ==================== ROOM ENDPOINTS ====================

    ApiAddRoom: builder.mutation<any, { house_id: string; count: number }>({
      query: (body) => ({
        url: "/room/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),

    ApiGetAllRooms: builder.query<
      any,
      { page?: number; limit?: number; house_id?: string }
    >({
      query: ({ page = 1, limit = 10, house_id }) => ({
        url: `/room?page=${page}&limit=${limit}${
          house_id ? `&house_id=${house_id}` : ""
        }`,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),
    ApiGetRoomById: builder.query<any, string>({
      query: (id) => ({
        url: `/room/${id}`,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),
    ApiUpdateRoom: builder.mutation<
      any,
      { id: string; data: Partial<{ number: number }> }
    >({
      query: ({ id, data }) => ({
        url: `/room/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Room"],
    }),
    ApiDeleteRoom: builder.mutation<any, string>({
      query: (id) => ({
        url: `/room/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),

    getLastRoomNumber: builder.query<{ lastNumber: number }, string>({
      query: (houseId) => ({
        url: `/room/last-number?houseId=${houseId}`,
        method: "GET",
      }),
    }),

    // ==================== RACK ENDPOINTS ====================
    ApiAddRack: builder.mutation<
      any,
      {
        number: number;
        house_id: string;
        room_id: string;
        total_shelf: number;
        shelf_capacity: number;
      }
    >({
      query: (body) => ({
        url: "/rack/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Rack"],
    }),
    ApiGetAllRacks: builder.query<
      any,
      { page?: number; limit?: number; room_id?: string; search?: string }
    >({
      query: ({ page = 1, limit = 10, room_id, search }) => ({
        url: `/rack?page=${page}&limit=${limit}${
          room_id ? `&room_id=${room_id}` : ""
        }${search ? `&search=${search}` : ""}`,
        method: "GET",
      }),
      providesTags: ["Rack"],
    }),
    ApiGetRackById: builder.query<any, string>({
      query: (id) => ({
        url: `/rack/${id}`,
        method: "GET",
      }),
      providesTags: ["Rack"],
    }),
    ApiUpdateRack: builder.mutation<
      any,
      {
        id: string;
        data: Partial<{
          number: number;
          total_shelf: number;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/rack/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Rack"],
    }),
    ApiDeleteRack: builder.mutation<any, string>({
      query: (id) => ({
        url: `/rack/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rack"],
    }),

    // ==================== SHELF ENDPOINTS ====================
    ApiAddShelf: builder.mutation<
      any,
      {
        number: number;
        rack_id: string;
        capacity: number;
      }
    >({
      query: (body) => ({
        url: "/shelf",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shelf"],
    }),
    ApiGetAllShelves: builder.query<
      any,
      { page?: number; limit?: number; rack_id?: string }
    >({
      query: ({ page = 1, limit = 10, rack_id }) => ({
        url: `/shelf?page=${page}&limit=${limit}${
          rack_id ? `&rack_id=${rack_id}` : ""
        }`,
        method: "GET",
      }),
      providesTags: ["Shelf"],
    }),
    ApiGetShelfById: builder.query<any, string>({
      query: (id) => ({
        url: `/shelf/${id}`,
        method: "GET",
      }),
      providesTags: ["Shelf"],
    }),
    ApiGetShelfFiles: builder.query<any, string>({
      query: (shelf_id) => ({
        url: `/shelf/shelfdetail/${shelf_id}`,
        method: "GET",
      }),
      providesTags: ["Shelf"],
    }),

    ApiUpdateShelf: builder.mutation<
      any,
      {
        id: string;
        data: Partial<{
          number: number;
          capacity: number;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/shelf/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Shelf"],
    }),
    ApiDeleteShelf: builder.mutation<any, string>({
      query: (id) => ({
        url: `/shelf/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shelf"],
    }),

    // ==================== FILE ENDPOINTS ====================

    ApiGetDashboardStats: builder.query<any, void>({
      query: () => ({
        url: `/file/stats`,
        method: "GET",
      }),
      providesTags: ["File"],
    }),
    ApiAddFile: builder.mutation({
      query: (body) => ({
        url: "/file/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["File"],
    }),
    ApiGetAllFiles: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        shelf?: string;
        status?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
        house?: string;
        room?: string;
        rack?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 10,
        shelf,
        status,
        search,
        startDate,
        endDate,
        house,
        room,
        rack,
      }) => ({
        url: `/file?page=${page}&limit=${limit}${
          shelf ? `&shelf=${shelf}` : ""
        }${status ? `&status=${status}` : ""}${
          search ? `&search=${search}` : ""
        }${startDate ? `&startDate=${startDate}` : ""}${
          endDate ? `&endDate=${endDate}` : ""
        }${house ? `&house=${house}` : ""}${room ? `&room=${room}` : ""}${rack ? `&rack=${rack}` : ""}`,
        method: "GET",
      }),
      providesTags: ["File"],
    }),

    ApiExportFiles: builder.query<Blob, any>({
      query: (params) => ({
        url: `/file/export-logs`,
        method: "GET",
        params: {
          ...params,
          startDate: params.startDate
            ? new Date(params.startDate).toISOString()
            : undefined,
          endDate: params.endDate
            ? new Date(params.endDate).toISOString()
            : undefined,
        },
        responseHandler: (response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),

    ApiAddFileSlip: builder.mutation<any, { id: string; image: string }>({
      query: (body) => ({
        url: `/fileTransaction/slip`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["File"],
    }),
    ApiUpdateFileSlip: builder.mutation<
      any,
      { id: string; issue_slip: string }
    >({
      query: ({ id, issue_slip }) => ({
        url: `/fileTransaction/${id}`,
        method: "PUT",
        body: { issue_slip },
      }),
      invalidatesTags: ["File"],
    }),

    ApiGetFileById: builder.query<any, string>({
      query: (id) => ({
        url: `/file/${id}`,
        method: "GET",
      }),
      providesTags: ["File"],
    }),
    ApiGetSbcaFiles: builder.query<
      any,
      { proposal_file_no?: string; limit?: number }
    >({
      query: ({ proposal_file_no, limit }) => ({
        url: `/file/sbca-files?${proposal_file_no ? `proposal_file_no=${proposal_file_no}&` : ""}${limit ? `limit=${limit}` : ""}`,
        method: "GET",
      }),
      providesTags: ["File"],
    }),
    ApiUpdateFile: builder.mutation<
      any,
      {
        id: string;
        data: any;
      }
    >({
      query: ({ id, data }) => ({
        url: `/file/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["File"],
    }),

    ApiReturnFile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/file/return/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["File"],
    }),
    ApiIssueFile: builder.mutation<
      any,
      {
        id: string;
        data: Partial<{
          number: string;
          description: string;
          applicant: string;
          purpose: string;
          status: "issued";
          requestedBy: string;
          department: string;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/file/issue/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["File"],
    }),

    ApiMarkFileMissing: builder.mutation<any, string>({
      query: (id) => ({
        url: `/file/missing/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["File"],
    }),

    ApiDeleteFile: builder.mutation<any, string>({
      query: (id) => ({
        url: `/file/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["File"],
    }),
    ApiGetSignedUrl: builder.query<any, { folder: string; count?: number }>({
      query: ({ folder = "fileTransitionSlip", count = 1 }) => ({
        url: `/get-signed-url?folder=${folder}&count=${count}`,
        method: "GET",
      }),
    }),

    // ==================== AUTH LOGOUT ====================
    ApiLogout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem("auth__token");
          localStorage.removeItem("auth__user");
          dispatch(removeUser());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
      invalidatesTags: ["Auth"],
    }),
    // ==================== USER ENDPOINTS ====================
    ApiGetAllUsers: builder.query<
      any,
      {
        status?: string;
        role?: string;
        search?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ status, role, search, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();

        if (status) params.append("status", status);
        if (role) params.append("role", role);
        if (search) params.append("search", search);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return {
          url: `/auth?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["User"],
    }),
    ApiAddUser: builder.mutation<
      any,
      {
        name: string;
        email: string;
        password: string;
        contact_number: string;
        address: string;
        cnic: string;
        role: string;
        avatar: string | null;
        leaving_letter: string[];
        joining_letter: string[];
        designation: string;
        status: string;
        permissions?: any;
      }
    >({
      query: (body) => ({
        url: "/auth",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    ApiGetSingleUser: builder.query<any, string>({
      query: (id) => ({
        url: `/auth/single/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    ApiGetPermissions: builder.query<any, void>({
      query: () => ({
        url: `/auth/permissions`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    ApiDeleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `auth/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    ApiEditUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `auth/${id}`,
        method: "PUT",
        body: data, // request body me user data send karo
      }),
      invalidatesTags: ["User"],
    }),

    ApiGetRoles: builder.query({
      query: () => ({
        url: "auth/role",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useApiSendOtpMutation,
  useApiLogoutMutation,
  useApiGetMeQuery,
  useApiLoginMutation,
  useApiGetPermissionsQuery,
  // User hooks
  useApiGetAllUsersQuery,
  useApiGetSingleUserQuery,
  useApiAddUserMutation,
  useApiDeleteUserMutation,
  useApiEditUserMutation,
  useApiGetRolesQuery,
  // House hooks
  useApiAddHouseMutation,
  useApiGetAllHousesQuery,
  useApiGetHouseByIdQuery,
  useApiUpdateHouseMutation,
  useApiDeleteHouseMutation,
  // Room hooks
  useApiAddRoomMutation,
  useApiGetAllRoomsQuery,
  useApiGetRoomByIdQuery,
  useApiUpdateRoomMutation,
  useApiDeleteRoomMutation,
  useGetLastRoomNumberQuery,
  // Rack hooks
  useApiAddRackMutation,
  useApiGetAllRacksQuery,
  useApiGetRackByIdQuery,
  useApiUpdateRackMutation,
  useApiDeleteRackMutation,
  // Shelf hooks
  useApiAddShelfMutation,
  useApiGetAllShelvesQuery,
  useApiGetShelfByIdQuery,
  useApiGetShelfFilesQuery,
  useApiUpdateShelfMutation,
  useApiDeleteShelfMutation,
  // File hooks
  useApiAddFileMutation,
  useApiGetAllFilesQuery,
  useApiGetSbcaFilesQuery,
  useApiGetFileByIdQuery,
  useLazyApiExportFilesQuery,
  useApiUpdateFileMutation,
  useApiDeleteFileMutation,
  useApiIssueFileMutation,
  useApiReturnFileMutation,
  useApiMarkFileMissingMutation,
  useApiGetDashboardStatsQuery,
  useApiGetSignedUrlQuery,
  useApiUpdateFileSlipMutation,
  useApiAddFileSlipMutation,
  useLazyApiGetSignedUrlQuery,
} = api;
