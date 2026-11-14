import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../socket/socket";
import axios from "axios";
import "./CustomerChat.css";

const CustomerChat = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const customerId = userData._id;
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:8000/chat",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Fetch restaurant details for header
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/restaurants/${restaurantId}`,
        );
        setRestaurant(res.data.restaurant ?? res.data);
      } catch (err) {
        console.error("Failed to load restaurant details:", err);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  // Initialize or fetch conversation
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await api.post("/", {
          restaurantId,
        });

        const id = response.data.conversation._id;
        setConversationId(id);

        const messageResponse = await api.get(`/${id}/messages`);
        setMessages(messageResponse.data.messages || []);
      } catch (error) {
        console.error(
          "Chat initialization failed:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      initializeChat();
    }
  }, [restaurantId]);

  // Socket event setup
  useEffect(() => {
    if (!conversationId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        return exists ? prev : [...prev, message];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.emit("joinConversation", { conversationId }, (response) => {
      console.log("Joined conversation:", response);
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [conversationId]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);

    socket.emit(
      "sendMessage",
      {
        conversationId,
        message: newMessage.trim(),
      },
      (response) => {
        setSending(false);
        if (response?.success) {
          setNewMessage("");
        } else {
          console.error(response?.message || "Failed to send message");
        }
      },
    );
  };

  if (loading) {
    return (
      <div className="zb-chat-center-screen">
        <div className="zb-chat-spinner" />
        <p>Connecting to restaurant...</p>
      </div>
    );
  }

  const restaurantName = restaurant?.name || "Restaurant";
  const restaurantImage = restaurant?.image;

  return (
    <div className="zb-customer-chat-page">
      <div className="zb-customer-chat-container">
        {/* Chat Header */}
        <div className="zb-chat-header">
          <div className="zb-chat-header-left">
            <button
              className="zb-chat-back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              ←
            </button>

            {restaurantImage ? (
              <img
                src={restaurantImage}
                alt={restaurantName}
                className="zb-chat-restaurant-avatar"
              />
            ) : (
              <div className="zb-chat-restaurant-avatar">
                {restaurantName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="zb-chat-header-info">
              <h4>{restaurantName}</h4>
              <p>{restaurant?.cuisine || "Direct chat with restaurant team"}</p>
            </div>
          </div>

          <div className="zb-chat-header-status">
            <span className="zb-status-dot"></span>
            <span>Online</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="zb-chat-thread">
          {messages.length === 0 ? (
            <div className="zb-chat-empty-state">
              <div className="zb-chat-empty-icon">💬</div>
              <h5>Say hello to {restaurantName}!</h5>
              <p>
                Have a question about the menu, allergy concerns, or special
                preparation? Send a message here!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId =
                typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
              const isCustomer = senderId?.toString() === customerId?.toString();

              const timeStr = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "";

              return (
                <div
                  key={msg._id || Math.random()}
                  className={`zb-chat-row ${isCustomer ? "customer" : "restaurant"}`}
                >
                  <div
                    className={`zb-chat-bubble ${isCustomer ? "customer" : "restaurant"
                      }`}
                  >
                    <p className="zb-chat-bubble-text">{msg.message}</p>
                    {timeStr && (
                      <div className="zb-chat-bubble-meta">
                        <span>{timeStr}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <div className="zb-chat-input-area">
          <form className="zb-chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="zb-chat-input-field"
              placeholder={`Message ${restaurantName}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button
              type="submit"
              className="zb-chat-send-button"
              disabled={!newMessage.trim() || sending}
            >
              <span>{sending ? "..." : "Send"}</span>
              <span>➤</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;
