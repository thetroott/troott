import { dummySermons } from "@/_data/dummySermons";
import EmptySermonsState from "@/components/shared/my-sermons/EmptySermonsState";
import SermonsTable from "@/components/shared/my-sermons/SermonsTable";

const Sermons = () => {
  const hasSermons = dummySermons.length > 0;

  // Empty state
  if (!hasSermons) {
    return <EmptySermonsState />;
  }

  // Table view
  return <SermonsTable sermons={dummySermons} />;
};

export default Sermons;
