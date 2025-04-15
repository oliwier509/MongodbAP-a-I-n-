import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";


const socket = io("http://localhost:3000");


function App() {
   const [message, setMessage] = useState("");
   const [messages, setMessages] = useState([]);


   useEffect(() => {
       socket.on("message", (data) => {
           setMessages((prev) => [...prev, data]);
       });


       return () => {
           socket.off("message");
       };
   }, []);


   const sendMessage = () => {
       if (message) {
           socket.emit("message", message);
           setMessage("");
        }
    };
   
    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
                        <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Wpisz wiadomość..."
            />
            <button onClick={sendMessage}>Wyślij</button>
            <h2>WebSocket TWwAIR test App</h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {messages.flat().map((msg, index) => (
                <div key={index} style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                margin: "10px",
                maxWidth: "400px",
                textAlign: "left",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                <p><strong>Date:</strong> {new Date(msg.readingDate).toLocaleString()}</p>
                <p><strong>Temperature:</strong> {msg.temperature}°C</p>
                <p><strong>Humidity:</strong> {msg.humidity}%</p>
                <p><strong>Pressure:</strong> {msg.pressure} hPa</p>
                <p><strong>Device ID:</strong> {msg.deviceId}</p>
                </div>
            ))}
            </div>
        </div>
    );
 }
 
 
 export default App;
 