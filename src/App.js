import React, { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typingMessage, setTypingMessage] = useState("");
    const messagesEndRef = useRef(null);

    const sendMessage = async () => {
        if (input.trim() === "") return;

        const userMessage = { from: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput(""); // Clear input immediately

        try {
            // Send the request to the backend
            const response = await axios.post("http://localhost:5000/generate", {
                prompt: input,   // Send prompt in JSON format
                model: "llama-3.3-70b-versatile"    // Optionally, pass a model
            }, {
                headers: {
                    "Content-Type": "application/json" // Ensure content type is JSON
                }, 
                timeout: 5000 // Set timeout to 5 seconds
            });

            const fullText = response.data.response;
            setTypingMessage("");

            let index = 0;
            const interval = setInterval(() => {
                if (index < fullText.length) {
                    setTypingMessage((prev) => prev + fullText[index]);
                    index++;
                    scrollToBottom();
                } else {
                    clearInterval(interval);
                    setMessages((prevMessages) => [...prevMessages, { from: "tutor", text: fullText }]);
                    setTypingMessage("");
                    scrollToBottom();
                }
            }, 30);

        } catch (error) {
            console.error("Error with API:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { from: "tutor", text: "Sorry, there was an error generating the response. Please try again." }
            ]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="d-flex flex-column justify-content-between vh-100 p-3 bg-info">
            <div className="bg-light rounded-3 shadow-sm text-center p-3 mb-4">
                <h2>My AI Bot with GROQ</h2>
            </div>

            <div className="flex-grow-1 bg-light rounded-3 p-3 mb-4 shadow-sm overflow-auto" style={{ maxHeight: "500px" }}>
                <div className="d-flex flex-column">
                    {messages.map((msg, index) => (
                        <div key={index} className={`d-flex ${msg.from === "user" ? "justify-content-end" : "justify-content-start"}`}>
                            <div className={`p-3 mb-2 rounded-3 shadow-sm w-auto ${msg.from === "user" ? "bg-primary text-white" : "bg-success text-white"}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {typingMessage && (
                        <div className="d-flex justify-content-start">
                            <div className="p-3 mb-2 rounded-3 bg-light text-muted shadow-sm w-auto">
                                <ReactMarkdown>{typingMessage}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef}></div>
                </div>
            </div>

            <div className="d-flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="form-control me-2"
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="btn btn-primary">
                    Send
                </button>
            </div>
        </div>
    );
};

export default App;
