import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "sonner"

<Toaster richColors position="top-center" />;

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
