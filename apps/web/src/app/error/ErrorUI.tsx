import { useLocation } from "react-router-dom";

const ErrorUI = () => {
  const location = useLocation();

  return (
    <>
      <div>
        <h2>Error {location.state?.statusCode}: {location.state?.message}</h2>
      </div>
    </>
  );
};

export default ErrorUI;
