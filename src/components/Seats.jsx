import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Seats.css"; // Import the separate CSS file

const TOTAL_SEATS = 80;
const SEATS_PER_ROW = 7;

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [successAlert, setSuccessAlert] = useState(false);
  
  // Get user and token from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Fetch seats data
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://train-booking-backend-wine.vercel.app/api/seats/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Attach token
          },
        });
        setSeats(res.data);
      } catch (err) {
        console.error("Error fetching seats:", err);
        setError("Failed to load seats");
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [token]);
   
  // Book seats function
  // const handleBookSeats  = async () => {
  //   if (!user) {
  //     alert("You must be logged in to book seats.");
  //     return;
  //   }

  //   const numSeats = parseInt(inputValue);
  //   if (numSeats > 7) {
  //     alert("You can book a maximum of 7 seats.");
  //     return;
  //   }

  //   const availableSeats = seats.filter((seat) => !seat.is_reserved);
  //   if (availableSeats.length < numSeats) {
  //     alert("Not enough seats available!");
  //     return;
  //   }

  //   const bookedSeats = availableSeats.slice(0, numSeats);

  //   try {
  //     setLoading(true); // Set loading to true when starting the booking process
  //     await axios.post(
  //       "http://localhost:5000/api/seats/book",
  //       { seats: bookedSeats.map((s) => s.id) }, // Send only IDs
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     // Update the seats state
  //     setSeats((prevSeats) =>
  //       prevSeats.map((s) =>
  //         bookedSeats.some((b) => b.id === s.id) ? { ...s, is_reserved: true, reserved_by: user.id } : s
  //       )
  //     );

  //     // Store only the IDs of the booked seats
  //     setSelectedSeats(bookedSeats.map((s) => s.id));
  //     setInputValue(""); // Clear the input box
  //   } catch (err) {
  //     console.error("Booking error:", err);
  //     setError("Booking failed"); // Ensure this is a string
  //   } finally {
  //     setLoading(false); // Set loading to false after the booking process
  //   }
  // };
  const handleBookSeats = async () => {
    const count = parseInt(inputValue);
    if (!user || !count || count <= 0 || count > 7) return;
  
    setLoading(true);
    setError("");
    setSuccessAlert(false);
  
    try {
      let availableSeats = seats.filter((seat) => !seat.is_reserved);
      let rowMap = {};
  
      // Group available seats by row
      availableSeats.forEach((seat) => {
        let row = Math.floor((seat.id - 1) / 7); // Adjust for 0-based row
        if (!rowMap[row]) rowMap[row] = [];
        rowMap[row].push(seat.id);
      });
  
      let bookedSeats = [];
  
      // First, try to book 'count' seats from any row with enough continuous seats
      for (let row in rowMap) {
        const sortedRowSeats = rowMap[row].sort((a, b) => a - b);
        for (let i = 0; i <= sortedRowSeats.length - count; i++) {
          const slice = sortedRowSeats.slice(i, i + count);
          const isContinuous = slice.every((val, idx) => idx === 0 || val === slice[idx - 1] + 1);
          console.log(isContinuous);
          if (isContinuous) {
            bookedSeats = slice;
            break;
          }
        }
        console.log(bookedSeats);
        if (bookedSeats.length > 0) break;

        console.log(sortedRowSeats);
      }
   
  
      // If no continuous seats found, pick first 'count' available seats
      if (bookedSeats.length === 0 && availableSeats.length >= count) {
        bookedSeats = availableSeats.slice(0, count).map((seat) => seat.id);
      }
  
      if (bookedSeats.length === 0) {
        setError("Not enough seats available.");
        setLoading(false);
        return; // No seats available to book
      }
      console.log(bookedSeats);
      // Send booking request to backend
      await axios.post(
        "https://train-booking-backend-wine.vercel.app/api/seats/book",
        { seats: bookedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update seat states
      setTimeout(() => {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            bookedSeats.includes(seat.id)
              ? { ...seat, is_reserved: true, isSelected: false }
              : seat
          )
        );
        setSelectedSeats(bookedSeats);
        setInputValue("");
        setSuccessAlert(true);
        setLoading(false);
      }, 1000); 
    } catch (err) {
      console.error("Booking error:", err);
      setError("Booking failed. Please try again.");
      setLoading(false);
    } 
  };
  
  
  
  // Reset seats function
  const handleReset  = async () => {
    if (!user) {
      alert("You must be logged in to reset bookings.");
      return;
    }

    try {
      await axios.post("https://train-booking-backend-wine.vercel.app/api/seats/reset", {}, { headers: { Authorization: `Bearer ${token}` } });

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
    <div className="container">
      <div className="inside-container">
        <div className="seats-grid card">
          <h2 className="title"> Ticket Booking</h2>
          <div className="seatGrid">
            {/* {seats.map((isBooked, index) => (
              <div
                key={index}
                className={`seat bg-success ${
                  isBooked ? "bg-warning" : selectedSeats.includes(index) ? "selected" : ""
                }`}
              >
                {index + 1}
              </div>
            ))} */}
            {seats.map((seat) => (
    <div
      key={seat.id}
      className={`seat rounded
        ${seat.is_reserved ? "bg-warning" : "bg-success"} 
        ${selectedSeats.includes(seat.id) && !seat.is_reserved ? "selected" : ""}
      `}
    >
      {seat.id} 
    </div>
  ))}
          </div>
        </div>
        <div className="booking-info">
          <div className="bSeats rounded bg-warning">
            <strong>Booked Seats = </strong>  {seats.filter((s) => s.is_reserved).length}
          </div>
          <div className="bSeats rounded bg-success">
            <strong>Available Seats = </strong> {seats.filter((s) => !s.is_reserved).length}
          </div>
        </div>
      </div>
      <div className="alerts">
        {error && (
  <div className="alert alert-danger alert-dismissible mt-3" role="alert">
    {error}
  </div>
)}
      {successAlert && (
  <div className="alert alert-success bg-success  alert-dismissible mt-3" role="alert">
    Seats booked successfully!
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
)}
        </div>
      <div className="booking-container">
        <div className="seat-selection">
          <div className="booked-seats">
            <label className="booking-label">Book Seats</label>
            <div className="selected-seats">
              {selectedSeats.map((seat) => (
                <span key={seat} className="seat bg-warning">
                  {seat}
                </span>
              ))}
            </div>
          </div>
       

          <div className="booking-actions">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter number of seats."
              className="form-control seat-input"
            />
            <button
              className={`btn btn-primary book-btn ${loading ? "loading" : ""}`}
              onClick={handleBookSeats}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span> Please Wait...
                </>
              ) : (
                "Book"
              )}
            </button>
          </div>
        </div>

        <div className="reset-div">
          <button className="btn btn-primary reset-btn"  disabled={loading} onClick={handleReset}>
            Reset Booking
          </button>
        </div>
      </div>
    
    </div>
  );
};

export default Seats;
