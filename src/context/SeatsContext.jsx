import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "./AuthContext"; // Import authentication context

export const SeatsContext = createContext();

const SeatsProvider = ({ children }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // Get logged-in user

  // Fetch seats data
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/seats/");
        setSeats(res.data);
      } catch (err) {
        console.error("Error fetching seats:", err);
        setError("Failed to load seats");
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, []);

  // Book seats function
  const bookSeats = async (numSeats) => {
    if (!user) {
      alert("You must be logged in to book seats.");
      return;
    }

    if (numSeats > 7) {
      alert("You can book a maximum of 7 seats.");
      return;
    }

    const availableSeats = seats.filter((seat) => !seat.is_reserved);
    if (availableSeats.length < numSeats) {
      alert("Not enough seats available!");
      return;
    }

    const bookedSeats = availableSeats.slice(0, numSeats);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/seats/book",
        { seats: bookedSeats.map((s) => s.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSeats((prevSeats) =>
        prevSeats.map((s) =>
          bookedSeats.some((b) => b.id === s.id) ? { ...s, is_reserved: true, reserved_by: user.id } : s
        )
      );
      setSelectedSeats(bookedSeats);
    } catch (err) {
      console.error("Booking error:", err);
      setError("Booking failed");
    }
  };

  // Reset seats function
  const resetSeats = async () => {
    if (!user) {
      alert("You must be logged in to reset bookings.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/seats/reset", {}, { headers: { Authorization: `Bearer ${token}` } });

      setSeats((prevSeats) =>
        prevSeats.map((s) => ({ ...s, is_reserved: false, reserved_by: null }))
      );
      setSelectedSeats([]);
    } catch (err) {
      console.error("Reset error:", err);
      setError("Failed to reset seats");
    }
  };

  return (
    <SeatsContext.Provider value={{ seats, selectedSeats, bookSeats, resetSeats, loading, error }}>
      {children}
    </SeatsContext.Provider>
  );
};

export default SeatsProvider;
