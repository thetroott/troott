import React from 'react';

interface DialogBorderProps {
    children?: React.ReactNode;
}

const DialogBorder: React.FC<DialogBorderProps> = ({ children }) => {
    return <div className="border-t border-gray-200/20 -mx-6 my-0"></div>;
};

export default DialogBorder;
