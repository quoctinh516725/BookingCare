import Header from "../../components/Header";
import Footer from "../../components/Footer";
function Default({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default Default;
