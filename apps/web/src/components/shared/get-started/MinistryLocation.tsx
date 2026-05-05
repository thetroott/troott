import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IMinistryLocation } from '@/utils/interfaces.util';

const MinistryLocation = (data: IMinistryLocation) => {
    const {
        id,
        location,
        description,
        label = 'Location',
        className = '',
        onChange,
    } = data;

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="location">{label}</Label>
            <Input
                id={id || 'location'}
                key="location"
                value={location}
                onChange={(e) => onChange?.(e.target.value)}
                className="bg-background"
                placeholder="your town or city name"
            />
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
};

export default MinistryLocation;
