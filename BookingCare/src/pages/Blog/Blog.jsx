import Filter from "../../components/Filter";
import CardBlog from "../../components/Card/CardBlog";
function Blog() {
  const blogType = [
    "Tất cả",
    "Chăm sóc da",
    "Trẻ hóa da",
    "Trị mụn",
    "Bảo vệ da",
    "Dinh dưỡng",
  ];
  return (
    <>
      <div className=" flex flex-col mt-[100px]">
        <div className="container mx-auto">
          <div className="">
            <Filter
              serviceType={blogType}
              title="Blog làm đẹp & Chăm sóc da"
              desc="Khám phá những bài viết chuyên sâu về chăm sóc da, bí quyết làm đẹp và cách điều trị các vấn đề về da từ các chuyên gia hàng đầu"
            />
            <div className="flex justify-between flex-wrap my-10">
              <CardBlog />
              <CardBlog />
              <CardBlog />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Blog;
