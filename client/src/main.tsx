import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// Router singleton must be imported here to ensure the Zustand subscription
// and declare module registration run before the React tree mounts.
import "./router";
import ToasterWithTheme from "./components/ToasterWIthTheme/ToasterWithTheme.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ToasterWithTheme />
  </StrictMode>,
);
