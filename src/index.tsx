import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppWithProviders from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLDivElement
);
root.render(
  // <React.StrictMode>
  <AppWithProviders />
  // </React.StrictMode>
);
