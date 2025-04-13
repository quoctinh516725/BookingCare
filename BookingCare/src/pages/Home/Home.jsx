import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Background from "../../assets/home/BackgroundHome.avif";
import CardService from "../../components/Card/CardService";
import CardSpecialist from "../../components/Card/CardSpecialist";
import CardBlog from "../../components/Card/CardBlog";
import ServiceService from "../../../services/ServiceService";
import SpecialistService from "../../../services/SpecialistService";
import BlogService from "../../../services/BlogService";

import testImg from "../../assets/home/testImg.webp";

function Home() {
  // State để lưu trữ dữ liệu
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState({
    services: true,
    specialists: true,
    blogs: true
  });
  const [error, setError] = useState({
    services: null,
    specialists: null,
    blogs: null
  });

  // Lấy dữ liệu từ API khi component được render
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu dịch vụ
        setLoading(prev => ({ ...prev, services: true }));
        setError(prev => ({ ...prev, services: null }));
        try {
          const servicesData = await ServiceService.getAllServices({ limit: 3 });
          console.log("Services data received:", servicesData);
          
          if (!servicesData || !Array.isArray(servicesData) || servicesData.length === 0) {
            setError(prev => ({ ...prev, services: "Không có dữ liệu dịch vụ" }));
            setServices([]);
          } else {
            // Kiểm tra dữ liệu có đủ trường cần thiết không
            const validatedServices = servicesData
              .filter(service => service && service.id)
              .slice(0, 3); // Chỉ lấy 3 dịch vụ đầu tiên
            
            setServices(validatedServices);
            
            if (validatedServices.length === 0) {
              setError(prev => ({ ...prev, services: "Không có dữ liệu dịch vụ hợp lệ" }));
            }
          }
        } catch (err) {
          console.error("Error fetching services:", err);
          setError(prev => ({ ...prev, services: "Không thể tải dữ liệu dịch vụ" }));
        } finally {
          setLoading(prev => ({ ...prev, services: false }));
        }

        // Lấy dữ liệu chuyên viên
        setLoading(prev => ({ ...prev, specialists: true }));
        setError(prev => ({ ...prev, specialists: null }));
        try {
          const specialistsData = await SpecialistService.getTopRatedSpecialists(3);
          console.log("Specialists data received:", specialistsData);
          
          if (!specialistsData || !Array.isArray(specialistsData) || specialistsData.length === 0) {
            setError(prev => ({ ...prev, specialists: "Không có dữ liệu chuyên viên" }));
            setSpecialists([]);
          } else {
            // Kiểm tra dữ liệu có đủ trường cần thiết không
            const validatedSpecialists = specialistsData
              .filter(specialist => specialist && specialist.id)
              .slice(0, 3); // Chỉ lấy 3 chuyên viên đầu tiên
            
            setSpecialists(validatedSpecialists);
            
            if (validatedSpecialists.length === 0) {
              setError(prev => ({ ...prev, specialists: "Không có dữ liệu chuyên viên hợp lệ" }));
            }
          }
        } catch (err) {
          console.error("Error fetching specialists:", err);
          setError(prev => ({ ...prev, specialists: "Không thể tải dữ liệu chuyên viên" }));
        } finally {
          setLoading(prev => ({ ...prev, specialists: false }));
        }

        // Lấy dữ liệu blog
        setLoading(prev => ({ ...prev, blogs: true }));
        setError(prev => ({ ...prev, blogs: null }));
        try {
          const blogsData = await BlogService.getAllBlogs({ limit: 3 }); // Lấy 3 bài viết mới nhất
          console.log("Blogs data received:", blogsData);
          
          if (!blogsData || !Array.isArray(blogsData) || blogsData.length === 0) {
            setError(prev => ({ ...prev, blogs: "Không có dữ liệu bài viết" }));
            setBlogs([]);
          } else {
            // Kiểm tra dữ liệu có đủ trường cần thiết không
            const validatedBlogs = blogsData.filter(blog => blog && blog.id);
            
            setBlogs(validatedBlogs);
            
            if (validatedBlogs.length === 0) {
              setError(prev => ({ ...prev, blogs: "Không có dữ liệu bài viết hợp lệ" }));
            }
          }
        } catch (err) {
          console.error("Error fetching blogs:", err);
          setError(prev => ({ ...prev, blogs: "Không thể tải dữ liệu bài viết" }));
        } finally {
          setLoading(prev => ({ ...prev, blogs: false }));
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, []);

  // Tạo component hiển thị skeleton trong khi đang tải
  const SkeletonCard = () => (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 animate-pulse">
      <div className="w-full h-[245px] bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );

  // Hiển thị thông báo lỗi
  const ErrorMessage = ({ message }) => (
    <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg text-center my-4">
      <p>{message}</p>
      <button 
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        onClick={() => window.location.reload()}
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="flex flex-col ">
      <div className="w-full h-[600px] relative">
        <img
          src={Background}
          alt="Background"
          className="w-full h-full bg-cover object-cover"
        />
        <div className="w-full h-full absolute left-0 top-0 bg-black/55"></div>
        <div className="absolute max-w-[850px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white">
          <h1 className="text-6xl font-bold font-arial whitespace-nowrap">
            Chăm Sóc Da Chuyên Nghiệp
          </h1>
          <p className="text-3xl mt-5">
            Khám phá các dịch vụ chăm sóc da cao cấp và được tư vấn bởi các
            chuyên gia hàng đầu
          </p>
          <Link to="/booking">
            <button className="mt-5">
              <i className="fa-solid fa-calendar-days"></i>{" "}
              <span>Đặt lịch ngay</span>
            </button>
          </Link>
        </div>
      </div>
      
      {/* Phần Dịch vụ */}
      <div className="container mx-auto mt-15">
        <div className="text-center">
          <h2 className="text-4xl font-bold uppercase">
            Dịch Vụ Của Chúng Tôi
          </h2>
          <p className="m-4 mb-10 text-xl text-[#565F6C]">
            Khám phá các dịch vụ chăm sóc da chuyên nghiệp
          </p>
        </div>
        
        {error.services && <ErrorMessage message={error.services} />}
        
        <div className="flex justify-between flex-wrap gap-4">
          {loading.services ? (
            // Hiển thị skeleton khi đang tải
            Array(3).fill(0).map((_, index) => (
              <SkeletonCard key={`service-skeleton-${index}`} />
            ))
          ) : services.length > 0 ? (
            // Hiển thị dữ liệu dịch vụ
            services.map((service) => (
              <CardService key={service.id} service={service} />
            ))
          ) : !error.services && (
            // Hiển thị thông báo nếu không có dữ liệu
            <div className="w-full text-center py-8">
              <p className="text-gray-500">Không có dịch vụ nào</p>
            </div>
          )}
        </div>
        <div className="flex justify-center m-10">
          <Link to="/service">
            <button className="p-4">Xem tất cả dịch vụ</button>
          </Link>
        </div>
      </div>
      
      {/* Phần Chuyên viên */}
      <div className="container mx-auto my-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold uppercase">
            Đội Ngũ Chuyên Viên
          </h2>
          <p className="m-4 mb-10 text-xl text-[#565F6C]">
            Đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi luôn sẵn sàng
            tư vấn và chăm sóc làn da của bạn với những dịch vụ chất lượng cao
          </p>
        </div>
        
        {error.specialists && <ErrorMessage message={error.specialists} />}
        
        <div className="flex justify-between flex-wrap gap-4">
          {loading.specialists ? (
            // Hiển thị skeleton khi đang tải
            Array(3).fill(0).map((_, index) => (
              <SkeletonCard key={`specialist-skeleton-${index}`} />
            ))
          ) : specialists.length > 0 ? (
            // Hiển thị dữ liệu chuyên viên
            specialists.map((specialist) => (
              <CardSpecialist key={specialist.id} specialist={specialist} />
            ))
          ) : !error.specialists && (
            // Hiển thị thông báo nếu không có dữ liệu
            <div className="w-full text-center py-8">
              <p className="text-gray-500">Không có chuyên viên nào</p>
            </div>
          )}
        </div>
        <div className="flex justify-center m-10">
          <Link to="/specialist">
            <button className="p-4">Xem tất cả chuyên viên</button>
          </Link>
        </div>
      </div>
      
      {/* Phần Trắc nghiệm da */}
      <div className="my-10">
        <div className=" bg-[#fde9f3]">
          <div className="container mx-auto flex py-20">
            <div className="w-[50%] py-10 pr-20">
              <h2 className="text-4xl font-bold uppercase">
                Khám phá loại da của bạn
              </h2>
              <p className="my-10 text-xl">
                Sử dụng công cụ trắc nghiệm da miễn phí của chúng tôi để nhận
                diện chính xác loại da và nhận được gợi ý về các dịch vụ và
                sản phẩm phù hợp nhất.
              </p>
              <div className="flex text-xl items-center space-x-4 my-5">
                <i className="fa-regular fa-circle-check text-3xl text-[var(--primary-color)]"></i>{" "}
                <span> Xác định chính xác loại da của bạn</span>
              </div>
              <div className="flex text-xl items-center space-x-4 my-5">
                <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
                <span> Nhận gợi ý dịch vụ phù hợp</span>
              </div>
              <div className="flex text-xl items-center space-x-4 my-5">
                <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
                <span>Tư vấn sản phẩm chăm sóc cá nhân hóa</span>
              </div>
              <div className="flex text-xl items-center space-x-4 my-5">
                <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
                <span> Hoàn toàn miễn phí, chỉ mất 2 phút</span>
              </div>
              <Link to="/test">
                <button className="mt-10">Làm trắc nghiệm miễn phí</button>
              </Link>
            </div>
            <div className="w-[50%]">
              <div className="overflow-hidden rounded-2xl">
                <img
                  className="hover:scale-110 transition-transform duration-500 ease-in-out"
                  src={testImg}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Phần Blog */}
      <div className="container mx-auto my-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold uppercase">Bài Viết Nổi Bật</h2>
          <p className="m-4 mb-10 text-xl text-[#565F6C]">
            Chia sẻ kiến thức và bí quyết chăm sóc da từ các chuyên gia hàng
            đầu
          </p>
        </div>
        
        {error.blogs && <ErrorMessage message={error.blogs} />}
        
        <div className="flex justify-between flex-wrap gap-4">
          {loading.blogs ? (
            // Hiển thị skeleton khi đang tải
            Array(3).fill(0).map((_, index) => (
              <SkeletonCard key={`blog-skeleton-${index}`} />
            ))
          ) : blogs.length > 0 ? (
            // Hiển thị dữ liệu blog
            blogs.map((blog) => (
              <CardBlog key={blog.id} blog={blog} />
            ))
          ) : !error.blogs && (
            // Hiển thị thông báo nếu không có dữ liệu
            <div className="w-full text-center py-8">
              <p className="text-gray-500">Không có bài viết nào</p>
            </div>
          )}
        </div>
        <div className="flex justify-center m-10">
          <Link to="/blog">
            <button className="p-4">Xem tất cả bài viết</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
