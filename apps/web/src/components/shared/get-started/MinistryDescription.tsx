import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { IMinistryDescription } from "@/utils/interfaces.util";

const MinistryDescription = (data: IMinistryDescription) => {
  
  const { id, description, label = "Description", className = "" } = data;


  return (
    <div className={`${className}`}>
      <Label htmlFor="description">{label}</Label>
      <div className="mt-2">
        <Textarea
          id={id || "description"}
          key="description"
          value={description}
          className="bg-muted/50 resize-none"
          style={{ 
            boxShadow: 'none',
            outline: 'none'
          }}
          placeholder="Describe your ministry's purpose or mission"
          rows={4}
        />
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>

  );
}

export default MinistryDescription