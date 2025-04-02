
import AdminSidebar from "../../components/Sidebar/adminSidebar";
function AdminDashboard() {
  return (
    <div className="w-full h-[100vh] flex flex-col ">
      <div className="flex h-full">
        <AdminSidebar />
        <div className="flex-1 h-full "></div>
      </div>
    </div>
  );
}

export default AdminDashboard;
