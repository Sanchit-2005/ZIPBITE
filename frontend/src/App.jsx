import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import Home from "./pages/Home";
import AuthenticationPage from "./pages/AuthenticationPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/menu/MenuPage";
import ItemDetails from "./pages/menu/ItemDetails";
import RestaurantPage from "./pages/resturants/RestaurantPage";
import RestaurantDetails from "./pages/resturants/RestaurantDetails";
import SearchMenu from "./pages/Search/SearchMenu";
import Search from "./pages/Search/Search";
import Cart from "./pages/cart/Cart";
import Order from "./pages/order/Order";
import Checkout from "./pages/Checkout/Checkout";

function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />}></Route>
      <Route path="/auth" element={<AuthenticationPage />}></Route>
      <Route path="/menu" element={<MenuPage />}></Route>
      <Route path="/items/:id" element={<ItemDetails />} />
      <Route path="/restaurants" element={<RestaurantPage />} />
      <Route
        path="/restaurants/:restaurantId"
        element={<RestaurantDetails />}
      />
      <Route path="/search" element={<Search />}></Route>
      <Route path="/cart" element={<Cart />}></Route>
      <Route path="orders" element={<Order />}></Route>
      <Route path="checkout" element={<Checkout />}></Route>
    </Routes>
  );
}

export default App;
