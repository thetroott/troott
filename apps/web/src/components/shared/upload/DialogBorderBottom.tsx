import React from 'react';

interface DialogBorderBottomProps {
  children?: React.ReactNode;
}

const DialogBorderBottom: React.FC<DialogBorderBottomProps> = ({ children }) => {
  return (
    <div className="border-t border-gray-100/20 -mx-6 mt-8 mb-1"></div>
  );
};

export default DialogBorderBottom;
