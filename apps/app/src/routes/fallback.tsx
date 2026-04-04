import Notfound from "@/screens/error/NotFound";
import RouteFallback from "@/screens/error/ErrorUI";
import Unauthorized from "@/screens/error/Unauthorized";

export const fallbackRoutes = [
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <Notfound />,
  },
  {
    path: "/route-fallback",
    element: <RouteFallback />,
  },
];
