import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client, chain } from "./constants";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Sidebar.jsx";

export function App() {
  return (
    <Router>
      <Sidebar />
      <div className="ml-48 ">
        <AppRoutes />
      </div>
      
    </Router>
  );
}