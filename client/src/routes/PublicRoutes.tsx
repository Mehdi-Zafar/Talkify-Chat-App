import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../zustand";

export default function PublicRoutes() {
  const { isLoggedIn, loading } = useAuthStore();

  if (isLoggedIn && !loading) {
    return <Navigate to="/chat" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
