import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import AdminService from "../../../../services/AdminService";
import PaymentService from "../../../../services/PaymentService";
import FeedbackService from "../../../../services/FeedbackService";
import { MessageContext } from "../../../contexts/MessageProvider";

// Create the context
const AppointmentContext = createContext();

// Custom hook to use the appointment context
export const useAppointments = () => useContext(AppointmentContext);

// Cache constants
const APPOINTMENTS_CACHE_KEY = "admin_appointments_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [showCancelled, setShowCancelled] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const message = useContext(MessageContext);

  // Format date/time helper
  const formatDateTime = useCallback((bookingDate, startTime) => {
    try {
      if (!bookingDate || !startTime) return "Chưa có thời gian";
      const dateTimeStr = `${bookingDate}T${startTime}`;
      return new Date(dateTimeStr).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Định dạng thời gian không hợp lệ";
    }
  }, []);

  // Get cached appointments
  const getCachedAppointments = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(APPOINTMENTS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp, filter } = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (data && timestamp && (now - timestamp < CACHE_DURATION) && filter === activeFilter) {
          console.log("Using cached appointments");
          return data;
        }
      }
      return null;
    } catch (err) {
      console.error("Error reading appointments cache:", err);
      return null;
    }
  }, [activeFilter]);

  // Save to cache
  const saveToCache = useCallback((data, filter) => {
    try {
      const timestamp = new Date().getTime();
      localStorage.setItem(
        APPOINTMENTS_CACHE_KEY,
        JSON.stringify({ data, timestamp, filter })
      );
    } catch (err) {
      console.error("Error saving appointments to cache:", err);
    }
  }, []);

  // Fetch payment statuses
  const fetchPaymentStatuses = useCallback(async (appointmentsList) => {
    const statuses = {};
    const promises = appointmentsList.map(async (appointment) => {
      try {
        const response = await PaymentService.getPaymentByBookingId(
          appointment.id
        );
        statuses[appointment.id] = response.success
          ? response.data.status || "UNPAID"
          : "UNPAID";
      } catch (err) {
        console.error(
          `Error fetching payment status for appointment ${appointment.id}:`,
          err
        );
        statuses[appointment.id] = "UNPAID";
      }
    });

    await Promise.all(promises);
    setPaymentStatuses(statuses);
  }, []);

  // Fetch all appointments
  const fetchAppointments = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedAppointments = getCachedAppointments();
        if (cachedAppointments) {
          setAppointments(cachedAppointments);
          fetchPaymentStatuses(cachedAppointments);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const data = await AdminService.getAllBookings(
        activeFilter === "Tất cả" ? null : activeFilter
      );

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      // Sort by created date (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });

      // Add formatted date/time to each appointment
      const formattedData = sortedData.map(appointment => ({
        ...appointment,
        formattedDateTime: formatDateTime(appointment.bookingDate, appointment.startTime)
      }));

      // Update state and cache
      setAppointments(formattedData);
      saveToCache(formattedData, activeFilter);
      fetchPaymentStatuses(formattedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Không thể tải danh sách lịch đặt. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, fetchPaymentStatuses, getCachedAppointments, formatDateTime, saveToCache]);

  // Handle appointment status update
  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      await AdminService.updateBookingStatus(appointmentId, newStatus);

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );

      // Invalidate cache
      localStorage.removeItem(APPOINTMENTS_CACHE_KEY);
      
      message.success(`Đã cập nhật trạng thái lịch hẹn thành công!`);
      return true;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      message.error(
        "Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại sau!"
      );
      return false;
    }
  }, [message]);

  // Get appointment feedback
  const getAppointmentFeedback = useCallback(async (appointmentId) => {
    setFeedbackLoading(true);
    try {
      const response = await FeedbackService.getFeedbackByBooking(appointmentId);
      if (response.success && response.data && response.data.length > 0) {
        setFeedback(response.data[0]);
        return response.data[0];
      } else {
        setFeedback(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedback(null);
      return null;
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  // Load appointments when component mounts or filter changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, activeFilter]);

  // Value object to be provided by context
  const value = {
    appointments,
    loading,
    error,
    paymentStatuses,
    activeFilter,
    showCancelled,
    selectedAppointment,
    feedback,
    feedbackLoading,
    setActiveFilter,
    setShowCancelled,
    fetchAppointments,
    updateAppointmentStatus,
    formatDateTime,
    setSelectedAppointment,
    getAppointmentFeedback,
    setFeedback
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export default AppointmentContext; 