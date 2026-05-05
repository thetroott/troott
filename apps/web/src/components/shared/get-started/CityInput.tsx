import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICityInput } from '@/utils/interfaces.util';

const CityInput = (data: ICityInput) => {
    const {
        city,
        className = '',
        description,
        onChange,
        readOnly = false,
    } = data;

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="city">City</Label>
            <Input
                id="city"
                key="city"
                value={city}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                className={
                    readOnly
                        ? 'bg-muted/50 cursor-not-allowed text-muted-foreground'
                        : ''
                }
                placeholder="Your town or city name"
            />
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
};

export default CityInput;
