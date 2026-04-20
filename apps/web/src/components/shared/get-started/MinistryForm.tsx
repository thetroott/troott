import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IMinistryForm } from "@/utils/interfaces.util";

const MinistryForm = (data: IMinistryForm) => {
  
  const { id, ministry, firstName, lastName, description, label = "Ministry", className = "" } = data;

  const LegalName = `${firstName} ${lastName}`.trim();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="ministry">{label}</Label>
      <Input
        id={id}
        key="ministry"
        value={ministry}
        className="bg-background"
        placeholder="Full official name of your ministry"
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>

  );
}

export default MinistryForm