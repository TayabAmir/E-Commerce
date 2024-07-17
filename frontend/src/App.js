import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './component/layout/Header/header'
import Footer from './component/layout/Footer/footer'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WebFont from "webfontloader"
import Home from "./component/Home/home"
import ProductDetails from './component/Product/ProductDetails';
import Products from "./component/Product/Products";
import Search from "./component/Product/Search";
import LoginSignup from './component/User/LoginSignup';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './actions/userActions';
import UserOptions from './component/layout/Header/UserOptions'
import Profile from "./component/User/Profile";
import ProtectedRoute from "./component/Router/ProtectedRoute";
import ProtectedAdminRoute from "./component/Router/ProtectedAdminRoute.js"
import UpdateProfile from "./component/User/UpdateProfile";
import UpdatePassword from "./component/User/UpdatePassword";
import ForgotPassword from "./component/User/ForgotPassword";
import ResetPassword from "./component/User/ResetPassword";
import Cart from "./component/Cart/Cart";
import Shipping from "./component/Cart/Shipping"
import ConfirmOrder from "./component/Cart/ConfirmOrder"
import Payment from "./component/Cart/Payment"
import OrderSuccess from "./component/Cart/OrderSuccess";
import MyOrders from "./component/Order/MyOrders";
import OrderDetails from "./component/Order/OrderDetails";
import Dashboard from "./component/Admin/Dashboard"
import ProductList from "./component/Admin/ProductList";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import NewProduct from './component/Admin/NewProduct';
import UpdateProduct from './component/Admin/UpdateProduct';
import OrdersList from './component/Admin/OrdersList';
import ProcessOrder from './component/Admin/ProcessOrder';
import UsersList from './component/Admin/UsersList';
import UpdateUser from './component/Admin/UpdateUser';
import ProductReviews from './component/Admin/ProductReviews';
import Contact from './component/layout/Contact/Contact';
import About from './component/layout/About/About';
import { useAlert } from 'react-alert';

function App() {
  const dispatch = useDispatch();
  const [stripeApiKey, setStripeApiKey] = useState("");
  const alert = useAlert();

    useEffect(() => {
      WebFont.load({
            google: {
              families: ["Roboto", "Droid Sans", "Chilanka"]
            }
          });
          dispatch(loadUser())
        const fetchStripeApiKey = async () => {
            try {
                const { data } = await axios.get("/api/v1/stripeapikey");
                setStripeApiKey(data.stripeApiKey);
                alert.success("Stripe Api Key: " + data.stripeApiKey);
            } catch (error) {
                console.error("Error fetching Stripe API key:", error);
                alert.error("Failed to fetch Stripe API key");
            }
        };

        fetchStripeApiKey();
    }, [alert,dispatch]);

  // async function getStripeApiKey() {
  //   const { data } = await axios.get("/api/v1/stripeapikey");
  //   setStripeApiKey(data.stripeApiKey);
  //   alert.success("Stripe Api Key:" + stripeApiKey)
  // }

  // useEffect(() => {
  //   WebFont.load({
  //     google: {
  //       families: ["Roboto", "Droid Sans", "Chilanka"]
  //     }
  //   });
  //   dispatch(loadUser())
  //   getStripeApiKey();
  // }, [dispatch])

  // window.addEventListener("contextmenu",(e) => e.preventDefault());

  const { isAuthenticated, user } = useSelector(state => state.user);

  return (
    <Router>
      <Header />
      {isAuthenticated && <UserOptions user={user} />}
      {stripeApiKey && (
        <Elements stripe={loadStripe(stripeApiKey)}>
          <Routes>
            <Route exact path="/process/payment" element={<Payment />} />
          </Routes>
        </Elements>
      )}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/product/:id" element={<ProductDetails />} />
        <Route exact path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route exact path="/search" element={<Search />} />
        <Route exact path="/login" element={<LoginSignup />} />
        <Route exact path="/password/forgot" element={<ForgotPassword />} />
        <Route exact path="/password/reset/:token" element={<ResetPassword />} />
        <Route exact path="/cart" element={<Cart />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/about" element={<About />} />
        <Route element={<ProtectedRoute />}>
          <Route exact path="/account" element={<Profile />} />
          <Route exact path="/me/update" element={<UpdateProfile />} />
          <Route exact path="/password/update" element={<UpdatePassword />} />
          <Route exact path="/login/shipping" element={<Shipping />} />
          <Route exact path="/order/confirm" element={<ConfirmOrder />} />
          <Route exact path="/success" element={<OrderSuccess />} />
          <Route exact path="/orders" element={<MyOrders />} />
          <Route exact path="/order/:id" element={<OrderDetails />} />
        </Route>
        <Route element={<ProtectedAdminRoute />}>
          <Route exact path="/admin/dashboard" element={<Dashboard />} />
          <Route exact path="/admin/products" element={<ProductList />} />
          <Route exact path="/admin/product" element={<NewProduct />} />
          <Route exact path="/admin/product/:id" element={<UpdateProduct />} />
          <Route exact path="/admin/orders" element={<OrdersList/>} />
          <Route exact path="/admin/order/:id" element={<ProcessOrder/>} />
          <Route exact path="/admin/users" element={<UsersList/>} />
          <Route exact path="/admin/user/:id" element={<UpdateUser/>} />
          <Route exact path="/admin/reviews" element={<ProductReviews/>} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;