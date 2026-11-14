import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OwnerSidebar from "./mainBox/OwnerSidebar";
import "./RestaurantOwner.css";
import "./RestaurantOwnerChats.css";

const RestaurantOwnerChats = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:8000/chat/owner-conversation",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError(
        error.response?.data?.message || "Failed to load customer conversations",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const name = c.customer?.name?.toLowerCase() || "";
      const email = c.customer?.email?.toLowerCase() || "";
      const lastMsg = c.lastMessage?.toLowerCase() || "";
      return name.includes(q) || email.includes(q) || lastMsg.includes(q);
    });
  }, [conversations, search]);

  const openConversation = (conversationId) => {
    navigate(`/restaurant-owner/chats/${conversationId}`);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <div className="roc-wrapper">
          {/* Header Banner */}
          <div className="roc-header">
            <div className="roc-header-text">
              <h2>Customer Messages</h2>
              <p>
                Connect and reply to customer inquiries, dietary notes, and
                order questions in real-time.
              </p>
            </div>

            <div className="roc-header-badge">
              <span>{conversations.length}</span>
              Conversations
            </div>
          </div>

          {/* Main Card */}
          <div className="roc-card">
            <div className="roc-toolbar">
              <h3 className="roc-toolbar-title">Active Conversations</h3>

              <div className="roc-search-wrap">
                <span className="roc-search-icon">🔍</span>
                <input
                  type="text"
                  className="roc-search-input"
                  placeholder="Search customer or message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="roc-loading">
                <div className="roc-spinner" />
                <p>Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="roc-empty">
                <div className="roc-empty-icon">⚠️</div>
                <h4>Unable to Load Messages</h4>
                <p>{error}</p>
                <button
                  className="btn-primary"
                  style={{ marginTop: "14px" }}
                  onClick={fetchConversations}
                >
                  Retry
                </button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="roc-empty">
                <div className="roc-empty-icon">💬</div>
                <h4>
                  {search
                    ? "No conversations match your search"
                    : "No conversations yet"}
                </h4>
                <p>
                  {search
                    ? "Try a different customer name or keyword."
                    : "When customers send a message from your restaurant menu page, their conversation will appear here."}
                </p>
              </div>
            ) : (
              <div className="roc-list">
                {filteredConversations.map((conversation) => {
                  const customer = conversation.customer;
                  const customerName = customer?.name || "Customer";
                  const initial = customerName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={conversation._id}
                      className="roc-item"
                      onClick={() => openConversation(conversation._id)}
                    >
                      <div className="roc-avatar">{initial}</div>

                      <div className="roc-details">
                        <div className="roc-details-top">
                          <h4 className="roc-customer-name">{customerName}</h4>
                          <span className="roc-time">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>

                        <div className="roc-details-bottom">
                          <p className="roc-preview-text">
                            {conversation.lastMessage ||
                              "Customer started a new conversation"}
                          </p>

                          <span className="roc-open-pill">
                            Open Chat →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOwnerChats;
