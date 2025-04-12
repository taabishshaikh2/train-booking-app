import React from "react";

const Navbar = ({ onLogout, isLoggedIn }) => {
  return (
    <nav className="d-flex m-2 justify-content-center">
      <h2 className="m-2">Train Booking</h2>
      {isLoggedIn && <button className="btn btn-success" onClick={onLogout}>Logout</button>}
    </nav>
  );
};

export default Navbar;
