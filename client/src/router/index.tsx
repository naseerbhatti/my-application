import { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Utils
import { getAndClearIntendedRoute } from "../utils/routeUtils";

// Redux
import { RootState } from "../redux/store";
import { setUser } from "../redux/reducers/authSlice";

// Components
import ProtectRoute from "./ProtectedRoute";
const NotFound = lazy(() => import("../components/NotFound"));
const DashboardLayout = lazy(() => import("../pages/DashboardLayout"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const LoginPage = lazy(() => import("../pages/auth/login"));
const Files = lazy(() => import("../pages/files"));
const RackManagment = lazy(() => import("../pages/RackManagment"));
const ViewFile = lazy(() => import("../pages/ViewFile/index"));
const ScanToIssue = lazy(() => import("../pages/scanToIssue"));
const UserManagment = lazy(() => import("../pages/userManagment"));
const ViewProfile = lazy(() => import("../components/ViewProfile"));
const ReturnFile = lazy(() => import("../pages/returnFile"));
const QrCode = lazy(() =>
  import("../pages/qrCode").then((module) => ({
    default: module.QrCode,
  })),
);
const RackDetails = lazy(() => import("../pages/rackDetails"));
const EditFile = lazy(() => import("../pages/editFile"));
const AddFile = lazy(() => import("../pages/addFile"));

const AppRouter = () => {
  const { user, loader } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle route restoration after login
  useEffect(() => {
    if (user && !loader) {
      const intendedRoute = getAndClearIntendedRoute();
      if (intendedRoute && intendedRoute !== location.pathname) {
        // Only navigate if we're currently on login page
        if (location.pathname === "/login") {
          navigate(intendedRoute, { replace: true });
        }
      }
    }
  }, [user, loader, navigate, location.pathname]);

  useEffect(() => {
    const savedUser = localStorage.getItem("auth__user");

    if (savedUser) {
      dispatch(setUser({ user: JSON.parse(savedUser) }));
    }
    // auth init complete
  }, [dispatch]);

  // Show loading while auth is initializing
  if (loader) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectRoute user={user}>
              <DashboardLayout />
            </ProtectRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="DASHBOARD"
              >
                <Dashboard />
              </ProtectRoute>
            }
          />
          <Route
            path="files"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="FILE"
              >
                <Files />
              </ProtectRoute>
            }
          />
          <Route
            path="files/:id"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ", "UPDATE"]}
                module="FILE"
              >
                <ViewFile />
              </ProtectRoute>
            }
          />
          <Route
            path="files/add"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["WRITE"]}
                module="FILE"
              >
                <AddFile />
              </ProtectRoute>
            }
          />
          <Route
            path="files/edit/:id"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["UPDATE"]}
                module="FILE"
              >
                <EditFile />
              </ProtectRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="USER"
              >
                <ViewProfile />
              </ProtectRoute>
            }
          />
          <Route
            path="files/issue/:id"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["UPDATE"]}
                module="FILE"
              >
                <ScanToIssue />
              </ProtectRoute>
            }
          />
          <Route
            path="files/return/:id"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["UPDATE"]}
                module="FILE"
              >
                <ReturnFile />
              </ProtectRoute>
            }
          />
          <Route
            path="files/:id/qrcode"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="FILE"
              >
                <QrCode />
              </ProtectRoute>
            }
          />

          <Route
            path="user-management"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="USER"
              >
                <UserManagment />
              </ProtectRoute>
            }
          />

          <Route
            path="rack-management"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="RACK"
              >
                <RackManagment />
              </ProtectRoute>
            }
          />
          <Route
            path="rack-management/:id"
            element={
              <ProtectRoute
                user={user}
                allowedPermissions={["READ"]}
                module="RACK"
              >
                <RackDetails />
              </ProtectRoute>
            }
          />
        </Route>

        {/* <Route path="/add" element={<AddDataTabs />} /> */}

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
