import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import BreadcrumbMap from "./breadcrumb-map";

const TopNav = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  // Build up full paths progressively
  const paths = pathParts.map(
    (_, idx) => "/" + pathParts.slice(0, idx + 1).join("/")
  );

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((path, idx) => {
            const isLast = idx === paths.length - 1;
            const label = BreadcrumbMap[path] || pathParts[idx];

            return (
              <BreadcrumbItem key={path}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={path}>{label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default TopNav;
