import { useState, useCallback, memo } from "react";
import PropTypes from "prop-types";

// Memo hóa component Filter để tránh re-render không cần thiết
const Filter = memo(function Filter(props) {
  const [type, setType] = useState("Tất cả");

  // Xử lý thay đổi danh mục with useCallback để tối ưu
  const handleCategoryChange = useCallback(
    (category) => {
      setType(category);
      // Gọi callback từ parent component nếu được cung cấp
      if (props.onCategoryChange) {
        props.onCategoryChange(category);
      }
    },
    [props.onCategoryChange]
  );

  // Xử lý thay đổi thanh tìm kiếm with useCallback
  const handleSearchInputChange = useCallback(
    (e) => {
      // Trì hoãn tìm kiếm cho đến khi người dùng ngừng gõ
      // Gọi callback từ parent component nếu được cung cấp
      if (props.onSearchChange) {
        props.onSearchChange(e.target.value);
      }
    },
    [props.onSearchChange]
  );

  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl font-bold font-arial whitespace-nowrap">
          {props.title}
        </h1>
        <p className="text-2xl text-black/70 mt-5">{props.desc}</p>
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
          {props.loading ? (
            <div className="flex justify-center items-center py-2">
              <div className="animate-pulse bg-gray-200 h-6 w-full rounded"></div>
            </div>
          ) : (
            <ul className="flex items-center text-[12px] text-black/80 font-semibold cursor-pointer">
              {props.serviceType.map((item, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => handleCategoryChange(item)}
                    className={`text-center transition-colors duration-200 px-2 py-1 ${
                      type === item
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

// Thêm PropTypes cho component
Filter.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string,
  serviceType: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onCategoryChange: PropTypes.func,
  onSearchChange: PropTypes.func,
};

// Thêm defaultProps
Filter.defaultProps = {
  desc: "",
  loading: false,
};

// Set displayName cho debugging
Filter.displayName = "Filter";

export default Filter;
