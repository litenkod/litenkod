import { Route, Routes } from "react-router-dom";
import Apex from "./pages/Apex";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apex" element={<Apex />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
