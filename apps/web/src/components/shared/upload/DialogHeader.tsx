import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface DialogHeaderProps {
    title: string;
    handleClose: () => void;
    children?: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ title, handleClose }) => {
    return (
        <div className="relative">
            <button
                onClick={handleClose}
                className="absolute left-0 top-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center">{title}</div>
        </div>
    );
};

export default DialogHeader;
