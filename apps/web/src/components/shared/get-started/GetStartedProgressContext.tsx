import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type GetStartedProgressContextValue = {
    busy: boolean;
    setBusy: (busy: boolean) => void;
    /** Set by {@link DocumentVerificationModal} while open and dirty. */
    documentVerificationLeave: DocumentVerificationLeaveHandlers | null;
    registerDocumentVerificationLeave: (
        handlers: DocumentVerificationLeaveHandlers | null,
    ) => void;
};

export type DocumentVerificationLeaveHandlers = {
    isDirty: boolean;
    requestLeave: (proceed: () => void) => void;
};

const GetStartedProgressContext =
    createContext<GetStartedProgressContextValue | null>(null);

export function GetStartedProgressProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [busy, setBusyState] = useState(false);
    const [documentVerificationLeave, setDocumentVerificationLeave] =
        useState<DocumentVerificationLeaveHandlers | null>(null);
    const setBusy = useCallback((value: boolean) => {
        setBusyState(value);
    }, []);
    const registerDocumentVerificationLeave = useCallback(
        (handlers: DocumentVerificationLeaveHandlers | null) => {
            setDocumentVerificationLeave(handlers);
        },
        [],
    );

    const value = useMemo(
        () => ({
            busy,
            setBusy,
            documentVerificationLeave,
            registerDocumentVerificationLeave,
        }),
        [busy, documentVerificationLeave, registerDocumentVerificationLeave, setBusy],
    );

    return (
        <GetStartedProgressContext.Provider value={value}>
            {children}
        </GetStartedProgressContext.Provider>
    );
}

/** UC-SE66: shared Continue busy flag for Save & Exit disable. */
export function useGetStartedCheckpointBusy(): GetStartedProgressContextValue {
    const ctx = useContext(GetStartedProgressContext);
    if (!ctx) {
        throw new Error(
            'useGetStartedCheckpointBusy must be used within GetStartedProgressProvider',
        );
    }
    return ctx;
}
