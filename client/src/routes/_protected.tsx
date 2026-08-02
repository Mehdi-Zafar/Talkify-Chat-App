import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "../components";
import { useSocketStore } from "@/zustand";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    const { isLoggedIn, loading } = context.auth;
    if (!isLoggedIn && !loading) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const socketConnect = useSocketStore((state) => state.connect);

  useEffect(() => {
    socketConnect();
  }, []);

  return (
    <div className="flex shrink-0 h-screen overflow-clip">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
