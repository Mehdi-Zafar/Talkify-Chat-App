import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from "react-router-dom";
import { Chat, Home, Profile, Settings, SignIn, SignUp } from "../pages";
import { Header } from "../components";
import ProtectedRoutes from "./ProtectedRoutes";
import PublicRoutes from "./PublicRoutes";

const HeaderLayout = () => {
  return (
    <div className="flex shrink-0 h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<></>} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route element={<HeaderLayout />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </>
  )
);
