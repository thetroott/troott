import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IPostalCode } from '@/utils/interfaces.util';

const PostalCode = (data: IPostalCode) => {
    const {
        postalCode,
        className = '',
        description,
        onChange,
        readOnly = false,
    } = data;

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="postal-code">Portal Code(Optional)</Label>
            <Input
                id="postal-code"
                key="postal-code"
                value={postalCode}
                readOnly={readOnly}
                onChange={(e) => {
                    const value = e.target.value;
                    // Only allow alphanumeric characters, spaces, and hyphens (common postal code formats)
                    const postalCodeRegex = /^[A-Za-z0-9\s-]*$/;
                    if (postalCodeRegex.test(value)) {
                        onChange?.(value);
                    }
                }}
                placeholder="Your area's postal code"
                className={
                    readOnly
                        ? 'bg-muted/50 cursor-not-allowed text-muted-foreground'
                        : ''
                }
            />
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
};

export default PostalCode;
