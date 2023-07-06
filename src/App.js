import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";

// My components
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import TeamUserMgmt from "./components/TeamUserMgmt";
import AdminAddUpdateUser from "./components/AdminAddUpdateUser";
import AdminDatabaseTable from "./components/AdminDatabaseTable";
import AdminUpdateUserGroup from "./components/AdminUpdateUserGroup";
import AdminCreateUserGroup from "./components/AdminCreateUserGroup";
import KanbanBoard from "./components/KanbanBoard";
import ProtectedRoutes from "./components/ProtectedRoutes";

// Beginning portion of url for all REQUEST:
// Axios.defaults.baseURL = "http://backend:3000";

function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(sessionStorage.getItem("accessToken")));
  const [userLoggedIn, setUserLoggedIn] = useState("");

  return (
    <BrowserRouter>
      <Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path="/" element={loggedIn ? <HomePage userLoggedIn={userLoggedIn} setUserLoggedIn={setUserLoggedIn} /> : <></>} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/homepage/user-management" element={<TeamUserMgmt />} />
          <Route path="/haha" element={<AdminDatabaseTable />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/homepage/admin-user-management" element={<AdminAddUpdateUser />} />
          <Route path="/homepage/admin-group-management" element={<AdminCreateUserGroup />} />
          <Route path="/AdminDatabaseTable" element={<AdminDatabaseTable />} />
          <Route path="/AdminUpdateUserGroup" element={<AdminUpdateUserGroup />} />
          <Route path="/homepage/kanban-board/:appAcronym" element={<KanbanBoard />} />
          <Route path="*" element={<h1 style={{ textAlign: "center", color: "blue" }}>Page 404! There's nothing here!</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Ensure browser constantly runs asynchronously *keeps refreshing*
if (module.hot) {
  module.hot.accept();
}

export default App;
