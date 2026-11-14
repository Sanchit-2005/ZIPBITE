import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../../socket/socket";
import OwnerSidebar from "./mainBox/OwnerSidebar";
import "./RestaurantOwner.css";
import "./RestaurantOwnerChat.css";

const RestaurantOwnerChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerEmail, setCustomerEmail] = useState("");

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const ownerId = userData._id?.toString();

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

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        setLoading(true);

        const response = await api.get(`/${conversationId}/messages`);
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);

        const customer = fetchedMessages.find(
          (msg) =>
            msg.sender &&
            typeof msg.sender === "object" &&
            msg.sender._id?.toString() !== ownerId,
        )?.sender;

        if (customer?.name) {
          setCustomerName(customer.name);
          if (customer.email) setCustomerEmail(customer.email);
        }
      } catch (error) {
        console.error(
          "Failed to fetch messages:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, ownerId]);

  useEffect(() => {
    if (!conversationId) return;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        const alreadyExists = prev.some((item) => item._id === message._id);
        return alreadyExists ? prev : [...prev, message];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      socket.emit("joinConversation", { conversationId }, (response) => {
        console.log("Owner joined conversation:", response);
      });
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("connect", joinRoom);
    };
  }, [conversationId]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending || !conversationId) return;

    if (!socket.connected) {
      console.error("Socket is not connected");
      return;
    }

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
          console.error(response?.message || "Message sending failed");
        }
      },
    );
  };

  const initial = customerName.charAt(0).toUpperCase();

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <div className="rot-wrapper">
          {/* Back Navigation */}
          <button
            className="rot-back-link"
            onClick={() => navigate("/restaurant-owner/chats")}
          >
            ← Back to all conversations
          </button>

          {/* Chat Container */}
          <div className="rot-chat-card">
            {/* Header */}
            <div className="rot-chat-header">
              <div className="rot-header-user">
                <div className="rot-avatar">{initial}</div>
                <div className="rot-user-info">
                  <h4>{customerName}</h4>
                  <p>{customerEmail || "Customer Conversation"}</p>
                </div>
              </div>

              <div className="rot-badge">
                <span className="rot-badge-dot"></span>
                <span>Active Chat</span>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="rot-thread">
              {loading ? (
                <div className="rot-loading">
                  <div className="rot-spinner" />
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="rot-empty-thread">
                  <div className="rot-empty-icon">💬</div>
                  <h5>No messages in this conversation yet</h5>
                  <p>
                    Reply below to start chatting with {customerName}.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId =
                    typeof msg.sender === "object"
                      ? msg.sender?._id
                      : msg.sender;
                  const isOwner = senderId?.toString() === ownerId;

                  const timeStr = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "";

                  return (
                    <div
                      key={msg._id || Math.random()}
                      className={`rot-message-row ${isOwner ? "owner" : "customer"
                        }`}
                    >
                      <div
                        className={`rot-bubble ${isOwner ? "owner" : "customer"
                          }`}
                      >
                        <p className="rot-bubble-text">{msg.message}</p>
                        {timeStr && (
                          <div className="rot-bubble-meta">
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

            {/* Input Form */}
            <div className="rot-input-area">
              <form className="rot-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="rot-input-field"
                  placeholder={`Reply to ${customerName}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="submit"
                  className="rot-send-btn"
                  disabled={!newMessage.trim() || sending || loading}
                >
                  <span>{sending ? "..." : "Send"}</span>
                  <span>➤</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOwnerChat;
