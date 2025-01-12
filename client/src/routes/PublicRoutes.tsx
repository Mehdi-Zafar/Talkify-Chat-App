import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../zustand";

export default function PublicRoutes() {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Navigate to="/chat" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
