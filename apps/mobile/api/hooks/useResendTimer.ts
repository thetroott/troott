import { useState, useEffect } from 'react';

interface UseResendTimerProps {
    initialTimer?: number;
}

export const useResendTimer = ({
    initialTimer = 45,
}: UseResendTimerProps = {}) => {
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    const startTimer = () => {
        setResendTimer(initialTimer);
        setCanResend(false);
    };

    return {
        resendTimer,
        canResend,
        startTimer,
    };
};
