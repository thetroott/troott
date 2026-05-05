import React from 'react';

interface DialogBorderTopProps {
    children?: React.ReactNode;
}

const DialogBorderTop: React.FC<DialogBorderTopProps> = ({ children }) => {
    return <div className="border-t border-gray-100/20 -mx-6 my-1"></div>;
};

export default DialogBorderTop;
