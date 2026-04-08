import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ILegalNameInput } from "@/utils/interfaces.util";

const LegalNameInput = (data: ILegalNameInput) => {
  
  const { id, firstName, lastName, description, label = "Legal Name", className = "" } = data;

  const LegalName = `${firstName} ${lastName}`.trim();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="Legal-name">{label}</Label>
      <Input
        id={id}
        key="Legal-name"
        value={LegalName}
        readOnly
        className="bg-muted/50 cursor-not-allowed text-muted-foreground"
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>

  );
}

export default LegalNameInput