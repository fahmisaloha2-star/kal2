import { BrowserRouter } from "react-router";
import { StoreProvider } from "./store";
import Website from "./Website";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Website />
      </BrowserRouter>
    </StoreProvider>
  );
}
