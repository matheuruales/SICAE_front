import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { SicaeProvider } from "./context/SicaeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SicaeProvider>
        <App />
      </SicaeProvider>
    </BrowserRouter>
  </StrictMode>
);
