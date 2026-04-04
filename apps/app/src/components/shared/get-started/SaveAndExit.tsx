import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SaveAndExit() {
  const navigate = useNavigate;

  const handleSaveAndExit = () => {
    // Save progress logic here
    //navigate(item.action as string)
    navigate();
  };
  
  return (
    <Button
      variant="ghost"
      onClick={handleSaveAndExit}
      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
    >
      <Save size={16} />
      <span>Save & Exit</span>
    </Button>
  );
}

export default SaveAndExit;
