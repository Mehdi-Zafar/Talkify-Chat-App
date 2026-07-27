import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "../components";

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
  return (
    <div className="flex shrink-0 h-screen overflow-clip">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
