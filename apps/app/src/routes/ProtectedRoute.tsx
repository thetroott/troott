// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth"; // Your auth hook

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   roles?: string[];
// }

// const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>; // Or a spinner
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (roles && !roles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// };

// This is the protected route component

// export default ProtectedRoute;
import React from "react";


interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]
}



const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  //const { user, loading } = useAuth();

  // if (loading) {
  //   return <div>Loading...</div>; // Or a spinner
  // }

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (roles && !roles.includes(user.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
