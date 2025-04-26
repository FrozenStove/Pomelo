import React, { useEffect, useState } from "react";
import axios from "axios";

interface ApiResponse {
  message: string;
}

function App() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          "http://localhost:3000/api/hello"
        );
        setMessage(response.data.message);
      } catch (err) {
        setError("Failed to fetch data from the backend");
        console.error("Error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Welcome to Pomelo</h1>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        {message ? (
          <p>Message from backend: {message}</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default App;
