import { useState } from "react";
function Filter(prop) {
  const [type, setType] = useState("Tất cả");
  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl font-bold font-arial whitespace-nowrap">
          {prop.title}
        </h1>
        <p className="text-2xl text-black/70 mt-5">
          {prop.desc}
        </p>
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
          />
        </div>
      </div>
      <div className="flex justify-center my-10">
        <div className="w-[60%] bg-[#F1F5F9] p-[3px]">
          <ul className="flex items-center text-[13px] text-black/80 font-semibold cursor-pointer">
            {prop.serviceType.map((item, index) => {
              return (
                <li
                  key={index}
                  onClick={(e) => setType(item)}
                  className={`text-center transition-colors duration-200   ${
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
        </div>
      </div>
    </>
  );
}

export default Filter;
