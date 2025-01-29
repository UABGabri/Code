import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./components/StyleComponents/AddQuestionsStyle.module.css";
import "./components/StyleComponents/Homepage.module.css";
import Homepage from "./components/Homepage";
import Register from "./components/Register";
import Login from "./components/Login";
import Modules from "./components/Modulespage";
import Profile from "./components/Profile";
import AssignaturaLayout from "./components/AssignaturaLayout";
import TestLayout from "./components/TestLayout";
import CreateManualQuizz from "./components/CreateManualQuizz";
import TestWithKey from "./components/TestWithKey";
import CustomTest from "./components/CustomTest";
import TestIALayout from "./components/TestIALayout";
import Dashboard from "./components/Dashboard";
import CreateQuizz from "./components/CreateQuizz";
import AddQuestion from "./components/AddQuestion";

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
        <Route path="/addQuestion" element={<AddQuestion />}></Route>
        <Route path="/testlayout" element={<TestLayout />}></Route>
        <Route path="/createQuizz" element={<CreateQuizz />}></Route>
        <Route path="/manualTest" element={<CreateManualQuizz />}></Route>

        <Route path="/realitzartest" element={<TestWithKey />}></Route>
        <Route path="/personalitzarTest" element={<CustomTest />} />

        <Route path="/testIA" element={<TestIALayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
