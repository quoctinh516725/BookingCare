import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Fragment } from "react";
import Default from "./components/Default";
import routes from "./routes";
function App() {
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
