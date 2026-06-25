import { BrowserRouter } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { StoreProvider } from "./store";
import Website from "./Website";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Website />
        <Analytics />
      </BrowserRouter>
    </StoreProvider>
  );
}
