import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SeatsPage from "./Seats";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setUser(true); // User is authenticated
    } else {
      navigate("/login"); // Redirect to login if not authenticated
    }
    
    setLoading(false);
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return <SeatsPage />;
};

export default Home;
