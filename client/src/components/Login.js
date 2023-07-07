import React, { useEffect } from "react";
import LoggedIn from "./LoggedIn";
import LoggedOut from "./LoggedOut";

function Login(props) {
  useEffect(() => {
    document.title = "Login Page | STEngg";
    window.scrollTo(0, 0);
  }, []);

  return <div>{props.loggedIn ? <LoggedIn setLoggedIn={props.setLoggedIn} /> : <LoggedOut setLoggedIn={props.setLoggedIn} />}</div>;
}

export default Login;
