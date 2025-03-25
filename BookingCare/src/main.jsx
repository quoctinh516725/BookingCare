import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageProvider } from "./contexts/MessageProvider.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MessageProvider>
        <App />
      </MessageProvider>
    </QueryClientProvider>
  </Provider>
  // </StrictMode>
);
