import React, { useMemo } from "react";

const PaymentStatusBadge = ({ status }) => {
  const paymentClasses = useMemo(() => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-yellow-100 text-yellow-800";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [status]);

  const paymentText = useMemo(() => {
    switch (status) {
      case "UNPAID":
        return "Chưa thanh toán";
      case "COMPLETED":
        return "Đã thanh toán";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return "Chưa thanh toán";
    }
  }, [status]);

  return (
    <span
      className={`min-w-[100px] flex justify-center px-3 py-1 inline-flex text-xs leading-5 font-semibold whitespace-nowrap rounded-full ${paymentClasses}`}
    >
      {paymentText}
    </span>
  );
};

export default React.memo(PaymentStatusBadge); 