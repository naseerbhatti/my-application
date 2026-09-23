// Route persistence utilities
export const saveIntendedRoute = (pathname: string): void => {
  // Don't save login routes or routes without slotId for students
  if (
    pathname !== "/login" &&
    pathname !== "/trainer/login" &&
    pathname !== "/courses"
  ) {
    localStorage.setItem("intendedRoute", pathname);
  }
};

export const getAndClearIntendedRoute = (): string | null => {
  const route = localStorage.getItem("intendedRoute");
  localStorage.removeItem("intendedRoute");
  return route;
};
