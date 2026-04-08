import { useEffect } from "react";
import type { ReactNode } from "react";

interface IPageHeader {
  title: string;
  description?: string;
  children?: ReactNode;
}

const PageHeader = (props: IPageHeader) => {
  const { title, description = "", children = null } = props;

  useEffect(() => {}, []);
  return (
    <>
      <div className="w-full flex items-start ">
        <div>
          <h2 className=" text-[28px] font-bold">{title}</h2>
          <p
            className=" text-[16px] text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        </div>

        {children && <div className="ml-auto">{children}</div>}
      </div>
    </>
  );
};

export default PageHeader;
