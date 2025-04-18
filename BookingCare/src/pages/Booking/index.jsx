import Booking from "./Booking";
import { ServiceCacheProvider } from "./contexts/ServiceCacheContext";

const BookingPage = () => {
  return (
    <ServiceCacheProvider>
      <Booking />
    </ServiceCacheProvider>
  );
};

export default BookingPage;
