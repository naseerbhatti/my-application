type Permission = "READ" | "WRITE" | "UPDATE" | "DELETE" | "EXPORT" ;  // Define the valid permissions

export const can = (permissions: { [module: string]: Permission[] } | undefined, module: string, action: Permission) => {
  if (!permissions) return false;  // Return false if permissions object is undefined
  const modulePermissions = permissions[module];  // Get the permissions for the specified module
  return modulePermissions ? modulePermissions.includes(action) : false;  // Check if the action exists in the module's permissions
};
