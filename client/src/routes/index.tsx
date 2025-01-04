import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from "react-router-dom";
import { Chat, Home, SignIn, SignUp } from "../pages";
import { Header } from "../components";

const HeaderLayout = () => {
  return (
    <div className="flex">
      <Header />
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<></>} />
      <Route element={<HeaderLayout />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Route>
    </>
  )
);
