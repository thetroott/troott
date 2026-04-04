import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import storage from "@/utils/storage.util";
import React from "react";

const Trigger = () => {
    const { open, setOpen } = useSidebar();
  
    React.useEffect(() => {
      storage.keep("sidebar-collapsed", String(!open));
    }, [open]);
  
    return <SidebarTrigger  onClick={() => setOpen(!open)} />;
  };

  export default Trigger