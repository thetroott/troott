import React from 'react';
import { Button } from '@/components/ui/button';
import DialogBorder from './DialogBorder';

interface DialogSubmitButtonProps {
  buttonText?: string;
  handleSubmit: () => Promise<void>;
  canSubmit: boolean;
}

const DialogSubmitButton: React.FC<DialogSubmitButtonProps> = ({ buttonText, handleSubmit, canSubmit }) => {
  return (
    <>
      <div className="pt-12"></div>
      <DialogBorder />
      <div className="flex justify-center">
        <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full max-w-xl"
            >
              {buttonText || 'Continue'}
            </Button>
      </div>
    </>
  );
};

export default DialogSubmitButton;
