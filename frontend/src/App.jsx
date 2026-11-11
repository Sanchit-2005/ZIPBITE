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
import RestaurantOwner from "./pages/resturantOwner/RestaurantOwner";
import { RestaurantOwnerProvider } from "./context/RestaurantOwnerContext";
import RestaurantOrders from "./pages/resturantOwner/RestaurantOrders";
import RestaurantOrderDetail from "./pages/resturantOwner/components/RestaurantOrderDetail";
import RestaurantOwnerMenu from "./pages/resturantOwner/components/RestaurantOwnerMenu";
import AddItem from "./pages/resturantOwner/components/AddItem";
import EditItem from "./pages/resturantOwner/components/EditItem";
import RestaurantOwnerProfile from "./pages/resturantOwner/components/RestaurantOwnerProfile";
import EditProfile from "./pages/resturantOwner/components/EditProfile";
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

      {/* Specific routes MUST come before the wildcard */}
      <Route
        path="/restaurant-owner/orders"
        element={
          <RestaurantOwnerProvider>
            <RestaurantOrders />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-orders/orders/:orderId"
        element={
          <RestaurantOwnerProvider>
            <RestaurantOrderDetail />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-owner/"
        element={
          <RestaurantOwnerProvider>
            <RestaurantOwner />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-owner/menu"
        element={
          <RestaurantOwnerProvider>
            <RestaurantOwnerMenu />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-owner/menu/addNewItem"
        element={
          <RestaurantOwnerProvider>
            <AddItem />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-owner/menu/editItem/:itemId"
        element={
          <RestaurantOwnerProvider>
            <EditItem />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-owner/profile"
        element={
          <RestaurantOwnerProvider>
            <RestaurantOwnerProfile />
          </RestaurantOwnerProvider>
        }
      />
      <Route
        path="/restaurant-owner/profile/edit"
        element={
          <RestaurantOwnerProvider>
            <EditProfile />
          </RestaurantOwnerProvider>
        }
      />
    </Routes>
  );
}

export default App;
