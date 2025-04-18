import { memo, useCallback, useState, useEffect } from "react";

const Filter = memo(function Filter(props) {
  const {
    title,
    desc,
    serviceType = [],
    loading,
    onCategoryChange,
    onSearchChange,
    selectedCategory,
  } = props;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [visibleCategories, setVisibleCategories] = useState([]);
  
  // Hiển thị danh mục theo lô để tránh render quá nhiều cùng lúc
  useEffect(() => {
    if (serviceType.length > 0 && !loading) {
      // Hiển thị ban đầu tối đa 5 danh mục
      const initialCategories = serviceType.slice(0, 5);
      setVisibleCategories(initialCategories);
      
      // Nếu có nhiều hơn 5 danh mục, thêm phần còn lại sau 100ms
      if (serviceType.length > 5) {
        const timeoutId = setTimeout(() => {
          setVisibleCategories(serviceType);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [serviceType, loading]);

  // Debounce tìm kiếm để tránh gọi quá nhiều lần khi người dùng gõ
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(debouncedSearchTerm);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [debouncedSearchTerm, onSearchChange]);

  const handleCategoryChange = useCallback(
    (category) => {
      if (onCategoryChange) {
        onCategoryChange(category);
      }
    },
    [onCategoryChange]
  );

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    setDebouncedSearchTerm(value);
  }, []);

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
            value={searchValue}
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
              {visibleCategories.map((item, index) => {
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
              {visibleCategories.length < serviceType.length && (
                <li className="animate-pulse text-center px-2 py-1 flex-1">
                  ...
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  );
});

export default Filter;