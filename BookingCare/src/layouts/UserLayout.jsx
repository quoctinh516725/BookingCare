import Header from "../components/Header";
import Footer from "../components/Footer";

function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[65px]">{children}</main>
      <Footer />
    </div>
  );
}

export default UserLayout;
