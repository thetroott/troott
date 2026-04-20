import { useEffect, useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Assuming you have a Shadcn Input
import { Check, ChevronsUpDown } from "lucide-react";
import { readCountries, getCountry } from "@/utils/helpers.util";
import { getUserLocation } from "@/hooks/shared/useLocation";
import type { ICountry, PhoneInputProps } from "@/utils/interfaces.util";

export default function PhoneInput({
  phoneNumber,
  country,
  onPhoneChange,
  onCountryChange,
  disabled,
  className,
}: PhoneInputProps) {
  const allCountries: ICountry[] = readCountries();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Auto-detect location for prefix
  useEffect(() => {
    if (!country) {
      const detect = async () => {
        const res = await getUserLocation();
        const code = res?.data?.country_code;
        if (code) {
          const found = getCountry(code.toUpperCase());
          if (found) onCountryChange(found);
        }
      };
      detect();
    }
  }, [country, onCountryChange]);

  const filteredCountries = allCountries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneCode?.includes(search)
  );

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label htmlFor="phone">Phone Number</Label>
      
      {/* Container to look like a single input field */}
      <div className="flex items-center gap-0 border rounded-md overflow-hidden bg-background focus-within:ring-1 focus-within:ring-ring">
        
        {/* Country Selector Trigger */}
        <Popover open={open && !disabled} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              className="h-10 rounded-none border-r px-3 gap-1 hover:bg-muted"
              disabled={disabled}
            >
              {country ? (
                <img
                  src={country.flag}
                  alt={country.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-muted rounded-full" />
              )}
              <ChevronsUpDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search country or code..." 
                value={search}
                onValueChange={setSearch}
              />
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredCountries.map((c: ICountry) => (
                  <CommandItem
                    key={c.code2}
                    value={c.name}
                    onSelect={() => {
                      onCountryChange(c);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <img src={c.flag} alt="" className="w-4 h-4 rounded-sm" />
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground text-xs">+{c.phoneCode}</span>
                      {country?.code2 === c.code2 && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Dial Code Display & Phone Input */}
        <div className="flex items-center flex-1 px-3">
          <span className="text-sm font-medium">
            {country?.phoneCode}
          </span>
          <input
            id="phone"
            type="tel"
            className="flex-1 bg-transparent border-none outline-none text-sm h-10 py-2"
            placeholder="80 000 0000"
            value={phoneNumber}
            disabled={disabled}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}