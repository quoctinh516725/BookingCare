import React from "react";
import { useServiceData, useSpecialistData, useBlogData } from "./useHomeData";
import { 
  HeroSection, 
  ServicesSection, 
  SpecialistsSection, 
  SkinTestSection,
  BlogsSection 
} from "./components/HomeComponents";

function Home() {
  // Sử dụng các custom hooks để lấy dữ liệu
  const { services, loading: servicesLoading, error: servicesError } = useServiceData();
  const { specialists, loading: specialistsLoading, error: specialistsError } = useSpecialistData();
  const { blogs, loading: blogsLoading, error: blogsError } = useBlogData();

  return (
    <div className="flex flex-col">
      {/* Phần Hero */}
      <HeroSection />
      
      {/* Phần Dịch vụ */}
      <ServicesSection 
        services={services}
        loading={servicesLoading}
        error={servicesError}
      />
      
      {/* Phần Chuyên viên */}
      <SpecialistsSection 
        specialists={specialists}
        loading={specialistsLoading}
        error={specialistsError}
      />
      
      {/* Phần Trắc nghiệm da */}
      <SkinTestSection />
      
      {/* Phần Blog */}
      <BlogsSection 
        blogs={blogs}
        loading={blogsLoading}
        error={blogsError}
      />
    </div>
  );
}

export default Home;
