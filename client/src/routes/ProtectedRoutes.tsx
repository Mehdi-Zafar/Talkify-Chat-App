import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../zustand";

export default function ProtectedRoutes() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
