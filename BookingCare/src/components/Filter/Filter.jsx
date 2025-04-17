import { memo, useCallback } from "react";
const Filter = memo(function Filter(props) {
  const {
    title,
    desc,
    serviceType,
    loading,
    onCategoryChange,
    onSearchChange,
    selectedCategory, // ✅ nhận từ props
  } = props;

  const handleCategoryChange = useCallback(
    (category) => {
      if (onCategoryChange) {
        onCategoryChange(category);
      }
    },
    [onCategoryChange]
  );

  const handleSearchInputChange = useCallback(
    (e) => {
      if (onSearchChange) {
        onSearchChange(e.target.value);
      }
    },
    [onSearchChange]
  );

  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl font-bold font-arial whitespace-nowrap">
          {title}
        </h1>
        <p className="text-2xl text-black/70 mt-5">{desc}</p>
      </div>
      <div className="flex justify-center my-10">
        <div className="w-[60%] bg-white px-4 shadow-xl rounded-full flex items-center">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Tìm kiếm dịch vụ..."
            className="w-full text-xl outline-none p-4"
            onChange={handleSearchInputChange}
          />
        </div>
      </div>
      <div className="flex justify-center my-10">
        <div className="w-[60%] bg-[#F1F5F9] p-[3px]">
          {loading ? (
            <div className="flex justify-center items-center py-2">
              <div className="animate-pulse bg-gray-200 h-6 w-full rounded"></div>
            </div>
          ) : (
            <ul className="flex items-center text-[12px] text-black/80 font-semibold cursor-pointer">
              {serviceType.map((item, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => handleCategoryChange(item)}
                    className={`text-center transition-colors duration-200 px-2 py-1 ${
                      selectedCategory === item
                        ? "bg-white border border-black/10"
                        : "border border-transparent"
                    }  flex-1 `}
                  >
                    {item}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
});

export default Filter;