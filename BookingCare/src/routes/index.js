import adminRoutes from "./adminRoute";
import userRoutes from "./userRoute";

const routes = [...adminRoutes, ...userRoutes];

export default routes;
