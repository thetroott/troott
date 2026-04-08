import type { ComponentType, SVGProps } from "react"

interface IIconText {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  text: string;
  className?: string;
}

export function IconText(data: IIconText) {
  
    const { icon: Icon, text, className = "" } = data;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span>{text}</span>
    </div>
  );
}
