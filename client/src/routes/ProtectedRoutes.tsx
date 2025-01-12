import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../zustand";

export default function ProtectedRoutes() {
  const { isLoggedIn, loading } = useAuthStore();

  if (!isLoggedIn && !loading) {
    return <Navigate to="/sign-in" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
