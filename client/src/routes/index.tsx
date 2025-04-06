import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
} from "react-router-dom";
import {
  AccountSettings,
  AdvancedSettings,
  AppearanceSettings,
  Chat,
  ChatSettings,
  DataStorageSettings,
  ForgotPassword,
  HelpSettings,
  Home,
  InviteSettings,
  NotificationSettings,
  PrivacySettings,
  Profile,
  ResetPassword,
  Settings,
  SignIn,
  SignUp,
} from "../pages";
import { Header, ThemeToggleButton } from "../components";
import ProtectedRoutes from "./ProtectedRoutes";
import PublicRoutes from "./PublicRoutes";
import AboutSettings from "../pages/Settings/SettingsTabs/AboutSettings";

const HeaderLayout = () => {
  return (
    <div className="flex shrink-0 h-screen overflow-clip">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

const NoHeaderLayout = () => {
  return (
    <div className="flex shrink-0 h-screen">
      <div className="flex-1">
        <Outlet />
        <ThemeToggleButton noHeader={true} />
      </div>
    </div>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<PublicRoutes />}>
        <Route element={<NoHeaderLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route element={<HeaderLayout />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/new" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Navigate to="/settings/account" />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="chat" element={<ChatSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="data-storage" element={<DataStorageSettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
            <Route path="advanced" element={<AdvancedSettings />} />
            <Route path="help" element={<HelpSettings />} />
            <Route path="invite" element={<InviteSettings />} />
            <Route path="about" element={<AboutSettings />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </>
  )
);
