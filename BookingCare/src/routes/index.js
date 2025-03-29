import Blog from "../pages/Blog";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Service from "../pages/Service";
import Specialist from "../pages/Specialist";
import Booking from "../pages/Booking";
import Test from "../pages/Test";
import Profile from "../pages/Profile";

const routes = [
  {
    path: "/",
    page: Home,
    isDefaultPage: true,
  },
  {
    path: "/service",
    page: Service,
    isDefaultPage: true,
  },
  {
    path: "/specialist",
    page: Specialist,
    isDefaultPage: true,
  },
  {
    path: "/booking",
    page: Booking,
    isDefaultPage: true,
  },
  {
    path: "/blog",
    page: Blog,
    isDefaultPage: true,
  },
  {
    path: "/test",
    page: Test,
    isDefaultPage: true,
  },
  {
    path: "/login",
    page: Login,
    isDefaultPage: false,
  },
  {
    path: "/sign-up",
    page: SignUp,
    isDefaultPage: false,
  },
  {
    path: "/profile",
    page: Profile,
    isDefaultPage: true,
  },
];

export default routes;
