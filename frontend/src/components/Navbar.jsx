import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Navbar.css";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { Authcontext } from "../context/Authcontext";
import { useContext } from "react";
const navLinks = [
  { label: "Home", path: "/home" },
  { label: "Menu", path: "/menu" },
  { label: "Restaurants", path: "/restaurants" },
  { label: "Offers", path: "/offers" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  const { isAuthenticated, handleLogout } = useContext(Authcontext);

  return (
    <nav className="zipbite-navbar">
      <div className="zipbite-navbar-inner">
        {/* Logo */}
        <Link to="/home" className="zipbite-brand">
          <img src="/logox.png" alt="ZIPBITE" />
        </Link>

        {/* Desktop navigation */}
        <div className="zipbite-desktop">
          <ul className="zipbite-nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>

          <div className="zipbite-actions">
            <form
              className="zipbite-search"
              role="search"
              onSubmit={handleSearch}
            >
              <input
                type="search"
                placeholder="Search food..."
                aria-label="Search food or restaurant"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />

              <button type="submit" aria-label="Search">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
              </button>
            </form>

            {isAuthenticated ? (
              <button
                type="button"
                className="zipbite-login"
                onClick={handleLogout}
              >
                Logout <LogoutIcon />
              </button>
            ) : (
              <Link to="/auth" className="zipbite-login">
                Login <LoginIcon />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="zipbite-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          onClick={() => {
            const drawer = document.getElementById("zipbiteMobileDrawer");
            if (drawer) {
              drawer.classList.toggle("is-open");
              const isOpen = drawer.classList.contains("is-open");
              document.body.classList.toggle("zipbite-menu-open", isOpen);
              document
                .querySelector(".zipbite-menu-toggle")
                ?.setAttribute("aria-expanded", String(isOpen));
            }
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className="zipbite-mobile-drawer" id="zipbiteMobileDrawer">
        <div className="zipbite-mobile-header">
          <span>Explore ZIPBITE</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => {
              document
                .getElementById("zipbiteMobileDrawer")
                ?.classList.remove("is-open");
              document.body.classList.remove("zipbite-menu-open");
              document
                .querySelector(".zipbite-menu-toggle")
                ?.setAttribute("aria-expanded", "false");
            }}
          >
            ✕
          </button>
        </div>

        <form
          className="zipbite-search zipbite-mobile-search"
          role="search"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            placeholder="Search food..."
            aria-label="Search food or restaurant"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button type="submit" aria-label="Search">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
          </button>
        </form>

        <ul className="zipbite-mobile-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                onClick={() => {
                  document
                    .getElementById("zipbiteMobileDrawer")
                    ?.classList.remove("is-open");
                  document.body.classList.remove("zipbite-menu-open");
                  document
                    .querySelector(".zipbite-menu-toggle")
                    ?.setAttribute("aria-expanded", "false");
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/auth"
          className="zipbite-login zipbite-mobile-login"
          onClick={() => {
            document
              .getElementById("zipbiteMobileDrawer")
              ?.classList.remove("is-open");
            document.body.classList.remove("zipbite-menu-open");
          }}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
