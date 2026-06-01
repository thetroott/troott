import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { IconRadioGroupProps } from '@/utils/interfaces.util';

type IconRadioSelectProps = IconRadioGroupProps & {
    /** Figma `6109:14936` / `6109:14563` Get Started document cards */
    variant?: 'default' | 'get-started-document';
};

const IconRadioSelect = (data: IconRadioSelectProps) => {
    const {
        value,
        options,
        onChange,
        className,
        variant = 'default',
    } = data;

    const isDocument = variant === 'get-started-document';

    return (
        <RadioGroup
            value={value}
            onValueChange={onChange}
            className={cn(
                'flex flex-col',
                isDocument ? 'gap-3' : 'gap-3',
                className,
            )}
        >
            {options.map((option) => (
                <label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                        'flex cursor-pointer items-center justify-between transition-colors',
                        isDocument
                            ? [
                                  'h-[58px] rounded-lg border bg-[#333234] px-4',
                                  'border-[#545454]/50',
                                  value === option.value &&
                                      'border-[#08ffdb]',
                              ]
                            : [
                                  'rounded-md border border-border bg-muted/70 px-4 py-4',
                                  'hover:border-primary/30',
                                  value === option.value && 'border-teal-400',
                              ],
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={
                                isDocument ? 'text-[#eaeaea]' : 'text-teal-400'
                            }
                        >
                            {option.icon}
                        </div>
                        <span
                            className={cn(
                                isDocument
                                    ? 'text-base leading-6 tracking-[0.16px] text-[#eaeaea]'
                                    : 'text-sm text-white',
                            )}
                        >
                            {option.label}
                        </span>
                    </div>

                    <RadioGroupItem
                        id={option.value}
                        value={option.value}
                        className={cn(
                            isDocument
                                ? 'border-[#545454] data-[state=checked]:border-[#08ffdb] data-[state=checked]:text-[#08ffdb]'
                                : 'border-gray-400 data-[state=checked]:border-teal-400 data-[state=checked]:text-teal-400',
                        )}
                    />
                </label>
            ))}
        </RadioGroup>
    );
};

export default IconRadioSelect;
