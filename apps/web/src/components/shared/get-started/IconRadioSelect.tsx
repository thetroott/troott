import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { IconRadioGroupProps } from "@/utils/interfaces.util";

const IconRadioSelect = (data: IconRadioGroupProps) => {
  const { value, options, onChange, className } = data;

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={cn("flex flex-col gap-3", className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={option.value}
          className={cn(
            "flex items-center justify-between rounded-md px-4 py-4 bg-muted/70 border border-border cursor-pointer transition-colors",
            "hover:border-primary/30",
            value === option.value && "border-teal-400"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="text-teal-400">
              {option.icon}
            </div>
            <span className="text-sm text-white">{option.label}</span>
          </div>

          <RadioGroupItem
            id={option.value}
            value={option.value}
            className={cn(
                "border-gray-400",
                value === option.value && "border-teal-400 text-teal-400",
            )}
          />
          
        </label>
      ))}
    </RadioGroup>
  );
};

export default IconRadioSelect;
