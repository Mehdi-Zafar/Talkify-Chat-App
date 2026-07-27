import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAuthStore } from "./zustand";
import { OtpResponse } from "./utils/contracts";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    // JS getters so beforeLoad always reads live Zustand state,
    // not a snapshot captured at module evaluation time.
    auth: {
      get isLoggedIn() {
        return useAuthStore.getState().isLoggedIn;
      },
      get loading() {
        return useAuthStore.getState().loading;
      },
    },
  },
} as any);

// Re-run beforeLoad on the active route whenever auth state changes.
// This is what makes login → /chat and logout → /sign-in work automatically.
useAuthStore.subscribe(() => {
  router.invalidate();
});

// Type registration — must be in the same file as createRouter.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }

  interface HistoryState {
    email?: string;
    otpData?: OtpResponse; // import OtpResponse from your contracts
  }
}
