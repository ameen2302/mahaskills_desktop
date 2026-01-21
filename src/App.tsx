import React from "react";
import { HashRouter } from "react-router-dom";
import "./App.css";
import { AppStateContextStore } from "./context/AppStateContext";
import Routes from "./pages/Routes";

interface AppProps { }

const App: React.FC<AppProps> = () => {
  return (
    <HashRouter>
      <AppStateContextStore>
        <Routes />
      </AppStateContextStore>
    </HashRouter>
  );
};

export default App;
