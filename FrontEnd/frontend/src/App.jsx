import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Homepage from "./components/Homepage";
import Register from "./components/Register";
import Login from "./components/Login";
import Modules from "./components/Modulespage";
import Profile from "./components/Profile";
import AssignaturaLayout from "./components/AssignaturaLayout";
import AfegirPregunta from "./components/AfegirPregunta";
import TestLayout from "./components/TestLayout";
import CrearTestProfessor from "./components/CrearTestProfessor";
import TestWithKey from "./components/TestWithKey";
import PersonalitzarTest from "./components/PersonalitzarTest";
import TestIALayout from "./components/TestIALayout";
import Dashboard from "./components/Dashboard";
import CreateQuizz from "./components/CreateQuizz";

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
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/profile" element={<Profile />}>
          {" "}
        </Route>

        <Route path="/assignatura/:id" element={<AssignaturaLayout />} />
        <Route path="/afegirPregunta" element={<AfegirPregunta />}></Route>
        <Route path="/testlayout" element={<TestLayout />}></Route>
        <Route path="/createQuizz" element={<CreateQuizz />}></Route>
        <Route path="/manualTest" element={<CrearTestProfessor />}></Route>

        <Route path="/realitzartest" element={<TestWithKey />}></Route>
        <Route path="/personalitzarTest" element={<PersonalitzarTest />} />

        <Route path="/testIA" element={<TestIALayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
