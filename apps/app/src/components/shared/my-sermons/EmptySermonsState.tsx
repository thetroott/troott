import { Button } from "@/components/ui/button";
import { features } from "@/_data/mysermonFeatures";
import { useNavigate } from "react-router-dom";

const EmptySermonsState = () => {
  const navigate = useNavigate();

  return (
    <div className=" bg-neutral-900/60 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-xl font-semibold mb-4">Welcome to Sermons</h1>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#333234]/50  rounded-[12px] p-6  relative overflow-hidden"
            >
              {/* Text Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold  mb-1 text-left">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed text-left">
                  {feature.description}
                </p>
              </div>

              {/* Illustration Section */}
              <div className="relative h-40 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg overflow-hidden"></div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="text-center space-y-8">
          <div className="space-y-5">
            <h2 className="text-xl  font-semibold ">
              Create your first Sermon!
            </h2>
            <p className="text-xs font-normal text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Share full messages, teachings, or sermon series to guide, uplift,
              and equip your audience. Your voice can impact lives, foster
              spiritual growth, and reach those who need it most, all while
              creating a lasting library of truth for others to revisit and
              share.
            </p>
          </div>

          <Button
            onClick={() => navigate("/upload-sermon")}
            className="bg-primary text-sm  hover:bg-teal-500 text-primary-foreground px-4 py-6  font-[500] "
          >
            Create sermon
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptySermonsState;
