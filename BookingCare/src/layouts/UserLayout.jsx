import Header from "../components/Header";
import Footer from "../components/Footer";

function UserLayout({ children }) {
  return (
    <div>
      <Header />
      <main className="pt-[65px]">{children}</main>
      <Footer />
    </div>
  );
}

export default UserLayout;
