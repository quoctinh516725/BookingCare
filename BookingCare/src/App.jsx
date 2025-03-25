import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Fragment, useEffect } from "react";
import Default from "./components/Default";
import routes from "./routes";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/userSlice";
import UserService from "./services/UserService";
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("access_token"));
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded?.userId) {
        handleGetDetailsUser(decoded?.userId, token);
      }
    }
  }, []);
  const handleGetDetailsUser = async (id, token) => {
    try {
      const response = await UserService.getDetailUser(id, token);
      dispatch(setUser(response.data, token));
    } catch (error) {
      console.log("Error get details user", error);
    }
  };
  return (
    <div>
      <Router>
        <Routes>
          {routes.map((item, index) => {
            const Layout = item.isDefaultPage ? Default : Fragment;
            const Page = item.page;
            return (
              <Route
                key={index}
                path={item.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
