// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export interface RouterContext {
  auth: {
    isLoggedIn: boolean;
    loading: boolean;
  };
}

function PageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  pendingComponent: PageSpinner,
  pendingMs: 300,
});
