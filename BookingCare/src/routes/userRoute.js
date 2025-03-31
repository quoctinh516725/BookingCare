import Blog from "../pages/Blog";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Service from "../pages/Service";
import Specialist from "../pages/Specialist";
import Booking from "../pages/Booking";
import Test from "../pages/Test";
import Profile from "../pages/Profile";
import UserLayout from "../layouts/UserLayout";
const routes = [
  {
    path: "/",
    page: Home,
    isDefaultPage: true,
    layout: UserLayout,
  },
  {
    path: "/service",
    page: Service,
    isDefaultPage: true,
    layout: UserLayout,
  },
  {
    path: "/specialist",
    page: Specialist,
    isDefaultPage: true,
    layout: UserLayout,
  },
  {
    path: "/booking",
    page: Booking,
    isDefaultPage: true,
    layout: UserLayout,
  },
  {
    path: "/blog",
    page: Blog,
    isDefaultPage: true,
    layout: UserLayout,
  },
  {
    path: "/test",
    page: Test,
    isDefaultPage: true,
    layout: UserLayout,
  },
  {
    path: "/login",
    page: Login,
    isDefaultPage: false,
    layout: UserLayout,
  },
  {
    path: "/sign-up",
    page: SignUp,
    isDefaultPage: false,
    layout: UserLayout,
  },
  {
    path: "/profile",
    page: Profile,
    isDefaultPage: true,
    layout: UserLayout,
  },
];

export default routes;
