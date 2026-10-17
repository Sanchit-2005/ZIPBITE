import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LandingPage from "./LandingPage";

export default function Home() {
  return (
    <div>
      <Navbar />
      <LandingPage />
      <Footer />
    </div>
  );
}
