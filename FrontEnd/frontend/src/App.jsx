import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Homepage from "./components/Homepage";
import Register from "./components/Register";
import Login from "./components/Login";
import Modules from "./components/Modulespage";
import Profile from "./components/Profile";
import AfegirAssignatura from "./components/AfegirAssignatura";
import AssignaturaLayout from "./components/AssignaturaLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />}>
          {" "}
        </Route>
        <Route path="/register" element={<Register />}>
          {" "}
        </Route>
        <Route path="/login" element={<Login />}>
          {" "}
        </Route>
        <Route path="/modules" element={<Modules />}>
          {" "}
        </Route>
        <Route path="/profile" element={<Profile />}>
          {" "}
        </Route>
        <Route path="/AfegirAssignatura" element={<AfegirAssignatura />}>
          {" "}
        </Route>
        <Route path="/assignatura/:id" element={<AssignaturaLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
