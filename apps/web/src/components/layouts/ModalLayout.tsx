import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface IModalLayout {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    showBackButton?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    useOutletFlow?: boolean;
}

export function ModalLayout(data: IModalLayout) {
    const {
        children,
        open,
        onOpenChange,
        title,
        showBackButton = true,
        maxWidth = 'lg',
        className = '',
        useOutletFlow = false,
    } = data;

    const navigate = useNavigate();

    const maxWidthClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    const handleClose = () => {
        if (useOutletFlow) {
            navigate(-1);
        } else if (onOpenChange) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`${maxWidthClasses[maxWidth]} ${className}`}
            >
                <DialogHeader className="relative">
                    {showBackButton && (
                        <button
                            onClick={handleClose}
                            className="absolute left-0 top-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                    <DialogTitle className="flex items-center justify-center">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="border-t border-gray-100/20 my-4"></div>

                <div className="py-4 text-left">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
