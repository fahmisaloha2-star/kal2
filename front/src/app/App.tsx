import { BrowserRouter } from "react-router";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { StoreProvider } from "./store";
import Website from "./Website";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Website />
        <SpeedInsights />
      </BrowserRouter>
    </StoreProvider>
  );
}
