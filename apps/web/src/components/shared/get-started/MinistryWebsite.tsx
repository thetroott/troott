import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IMinistryWebsite } from "@/utils/interfaces.util";

const MinistryWebsite = (data: IMinistryWebsite) => {
  
  const { id, website, description, label = "Website", className = "", onChange } = data;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="website">{label}</Label>
      <Input
        id={id || "website"}
        key="website"
        value={website}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-background"
        required={false}
        placeholder="www.example.com"
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>

  );
}

export default MinistryWebsite