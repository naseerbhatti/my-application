import { Navigate, useLocation } from "react-router-dom";
import { saveIntendedRoute } from "../utils/routeUtils";
import { can } from "../utils/permisson";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";

// Define the possible permissions
type Permission = "READ" | "WRITE" | "UPDATE" | "DELETE";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "librarian" | "staff" | "super_admin";
  permissions?: { [module: string]: Permission[] };  // Assuming permissions are stored in this structure
  [key: string]: any;
}

interface ProtectRouteProps {
  user: User | null;
  allowedRoles?: User["role"][];
  allowedPermissions?: Permission[];  // Now, this will only accept "READ", "WRITE", "UPDATE", "DELETE"
  children: React.ReactNode;
  module?: string;  // The module to check permissions for (e.g., 'FILE', 'USER')
}

const ProtectRoute: React.FC<ProtectRouteProps> = ({
  user,
  allowedRoles,
  allowedPermissions,
  children,
  module,
}) => {
  const location = useLocation();
  const {loader} = useSelector((state: RootState) => state.auth);


   if (loader) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading... 
      </div>
    );
  }

  if (!user) {
    // Save the intended route before redirecting to login
    saveIntendedRoute(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to the module's permissions
  if (allowedPermissions && module && !allowedPermissions.some((action) => can(user.permissions, module, action))) {
    // return <Navigate to="/dashboard" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectRoute;
