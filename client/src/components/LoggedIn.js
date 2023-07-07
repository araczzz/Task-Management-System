import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

function LoggedIn(props) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  let homepage_permit_admin = "Admin";
  // CheckGroup
  async function checkgroup() {
    let username = sessionStorage.getItem("stenggUsername");
    let groupName = homepage_permit_admin;
    try {
      const response = await Axios.post("/api/checkgroup", { username, groupName });
      if (response.data) {
        setIsAdmin(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkgroup();
  }, []);

  function handleLogout() {
    props.setLoggedIn(false);
    sessionStorage.removeItem("stenggUsername");
    navigate("/");
  }

  function toHomePage(e) {
    e.preventDefault();
    navigate("/homepage");
  }

  function handleUser(e) {
    e.preventDefault();
    try {
      if (isAdmin) {
        navigate("/homepage/admin-user-management");
      } else {
        navigate("/homepage/user-management");
      }
    } catch (error) {
      console.log("Error in User Management Button");
    }
  }

  function handleGroup(e) {
    e.preventDefault();
    try {
      if (isAdmin) {
        navigate("/homepage/admin-group-management");
      } else {
        navigate("/homepage/user-group-management");
      }
    } catch (error) {
      console.log("Error in Create Group Button");
    }
  }

  return (
    <form>
      <ul>
        <li className="li-right">
          <button className="button-homepage" onClick={handleLogout}>
            Sign Out
          </button>
        </li>
        {isAdmin ? (
          <li>
            <button className="button-homepage" onClick={handleGroup} type="submit">
              Group Management
            </button>
          </li>
        ) : null}
        <li>
          <button className="button-homepage" onClick={handleUser} type="submit">
            User Management
          </button>
        </li>
        <li className="li-left">
          <button className="button-homepage" onClick={toHomePage}>
            Home Page
          </button>
        </li>
      </ul>
      <br></br>
    </form>
  );
}

export default LoggedIn;
