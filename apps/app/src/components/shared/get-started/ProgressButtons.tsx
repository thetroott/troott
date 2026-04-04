import { useLocation, useNavigate } from "react-router-dom";
import OnboardingItems from "@/_data/onboarding";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";



const ProgressButtons = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const stepGroup = OnboardingItems.find((item) =>
    location.pathname.startsWith(item.action)
  );
  
  const steps = stepGroup?.steps?.map((step) => step.action) || [];
  const currentIndex = steps.findIndex((path) =>
    location.pathname.includes(path)
  );

  const handleBack = () => {
    if (currentIndex > 0) navigate(steps[currentIndex - 1]);
  };

  const handleContinue = () => {
    if (currentIndex < steps.length - 1) {
      navigate(steps[currentIndex + 1]);
    } else {
      // Final step: navigate to completion or dashboard
      navigate("/get-started");
    }
  };

  //if (!steps.length || currentIndex === -1) return null;

  return (
    <div>
      <div className="flex justify-between mt-8 pt-6 border-t gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="px-6 py-2 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="px-12 cursor-pointer transition-colors"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ProgressButtons;
