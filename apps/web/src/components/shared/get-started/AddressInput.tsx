import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IAddressInput } from '@/utils/interfaces.util';

const AddressInput = (data: IAddressInput) => {
    const {
        street,
        className = '',
        description,
        onChange,
        readOnly = false,
        placeholder,
    } = data;

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="address">Full Address</Label>
            <Input
                id="address"
                key="address"
                value={street}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                className={
                    readOnly ? 'bg-muted/50 cursor text-muted-foreground' : ''
                }
                placeholder={
                    data.placeholder || 'Your building name or street name'
                }
            />
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
};

export default AddressInput;
