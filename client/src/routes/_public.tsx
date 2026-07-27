import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ThemeToggleButton } from "../components";

export const Route = createFileRoute("/_public")({
  beforeLoad: ({ context }) => {
    const { isLoggedIn, loading } = context.auth;
    if (isLoggedIn && !loading) {
      throw redirect({ to: "/chat" });
    }
  },
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="flex shrink-0 h-screen">
      <div className="flex-1">
        <Outlet />
        <ThemeToggleButton header={true} />
      </div>
    </div>
  );
}
