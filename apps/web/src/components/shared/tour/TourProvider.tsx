import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import cookieService from '@/api/services/cookies';
import { PATH_GET_STARTED } from '@/routes/paths';
import {
    dispatchOnboardingProfileRefresh,
    ONBOARDING_STEP_TOUR,
    resolveOnboardingStep,
} from '@/utils/hub-onboarding.util';
import { isStudioHomePath } from '@/utils/studio-nav.util';
import TourOverlay, { type SpotlightRect } from './TourOverlay';
import TourStepPopover from './TourStepPopover';
import { completeOnboardingTour } from './complete-tour';
import {
    TOUR_SESSION_KEYS,
    TOUR_STEPS,
    type TourStepConfig,
} from './tour-steps';

interface TourContextValue {
    active: boolean;
    startTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

const TOUR_TARGET_WAIT_MS = 4000;

function measureTarget(selector: string): SpotlightRect | null {
    const node = document.querySelector(selector);
    if (!(node instanceof HTMLElement)) {
        return null;
    }
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
}

function scrollTargetIntoView(selector: string): void {
    const node = document.querySelector(selector);
    if (node instanceof HTMLElement) {
        node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
}

function waitForTourTarget(
    selector: string,
    maxMs = TOUR_TARGET_WAIT_MS,
): Promise<SpotlightRect | null> {
    const started = Date.now();

    return new Promise((resolve) => {
        const attempt = () => {
            const rect = measureTarget(selector);
            if (rect) {
                resolve(rect);
                return;
            }
            if (Date.now() - started >= maxMs) {
                resolve(null);
                return;
            }
            window.requestAnimationFrame(attempt);
        };
        attempt();
    });
}

export function useTour(): TourContextValue {
    const ctx = useContext(TourContext);
    if (!ctx) {
        return {
            active: false,
            startTour: () => {},
        };
    }
    return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creator } = useCreator();

    const user = userContext.user as { onboard?: { step?: number } } | null;
    const userType =
        userContext.userType || cookieService.getUserType() || '';
    const onboardingStep = resolveOnboardingStep(
        userType,
        minister,
        creator,
        user,
    );

    const [active, setActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(
        null,
    );
    const [busy, setBusy] = useState(false);
    const autoStartedRef = useRef(false);

    const isStudioHome = isStudioHomePath(location.pathname);
    const currentStep: TourStepConfig | null = active
        ? (TOUR_STEPS[stepIndex] ?? null)
        : null;

    const clearTourSessionFlags = useCallback(() => {
        sessionStorage.removeItem(TOUR_SESSION_KEYS.pending);
    }, []);

    const abortTour = useCallback(
        (message?: string) => {
            setActive(false);
            setStepIndex(0);
            setSpotlightRect(null);
            clearTourSessionFlags();
            if (message) {
                toast.error(message);
            }
        },
        [clearTourSessionFlags],
    );

    const finishTour = useCallback(async () => {
        setBusy(true);
        try {
            const result = await completeOnboardingTour();
            if (!result.ok) {
                toast.error(result.message ?? 'Could not complete the tour.');
                return;
            }
            sessionStorage.setItem(TOUR_SESSION_KEYS.dismissed, '1');
            clearTourSessionFlags();
            dispatchOnboardingProfileRefresh();
            setActive(false);
            setStepIndex(0);
            setSpotlightRect(null);
            navigate(PATH_GET_STARTED);
        } finally {
            setBusy(false);
        }
    }, [clearTourSessionFlags, navigate]);

    const goToStep = useCallback(
        (index: number) => {
            const step = TOUR_STEPS[index];
            if (!step) {
                abortTour('Tour step is unavailable.');
                return;
            }
            scrollTargetIntoView(step.target);

            void (async () => {
                const rect = await waitForTourTarget(step.target);
                if (!rect) {
                    abortTour(
                        'Could not highlight this part of the dashboard. Try refreshing the page.',
                    );
                    return;
                }
                setStepIndex(index);
                setSpotlightRect(rect);
            })();
        },
        [abortTour],
    );

    const startTour = useCallback(() => {
        if (onboardingStep >= ONBOARDING_STEP_TOUR) {
            toast.info('You have already completed the studio tour.');
            return;
        }
        setActive(true);
        window.requestAnimationFrame(() => {
            goToStep(0);
        });
    }, [goToStep, onboardingStep]);

    useEffect(() => {
        if (!active || !currentStep) {
            return;
        }

        const updateRect = () => {
            const rect = measureTarget(currentStep.target);
            if (!rect) {
                abortTour(
                    'Could not highlight this part of the dashboard. Try refreshing the page.',
                );
                return;
            }
            setSpotlightRect(rect);
        };

        const raf = window.requestAnimationFrame(() => {
            scrollTargetIntoView(currentStep.target);
            updateRect();
        });

        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [abortTour, active, currentStep]);

    useEffect(() => {
        if (!isStudioHome) {
            autoStartedRef.current = false;
        }
    }, [isStudioHome]);

    useEffect(() => {
        if (!isStudioHome || onboardingStep >= ONBOARDING_STEP_TOUR) {
            return;
        }
        const shouldStart =
            searchParams.get('tour') === '1' ||
            sessionStorage.getItem(TOUR_SESSION_KEYS.pending) === '1';
        if (!shouldStart || autoStartedRef.current) {
            return;
        }

        autoStartedRef.current = true;

        if (searchParams.get('tour') === '1') {
            const next = new URLSearchParams(searchParams);
            next.delete('tour');
            setSearchParams(next, { replace: true });
        }

        startTour();
    }, [
        isStudioHome,
        onboardingStep,
        searchParams,
        setSearchParams,
        startTour,
    ]);

    useEffect(() => {
        if (!active) {
            return;
        }
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [active]);

    const contextValue = useMemo(
        () => ({
            active,
            startTour,
        }),
        [active, startTour],
    );

    const handlePrimary = () => {
        if (!currentStep) {
            return;
        }
        if (currentStep.primaryLabel === 'Finish') {
            void finishTour();
            return;
        }
        goToStep(stepIndex + 1);
    };

    return (
        <TourContext.Provider value={contextValue}>
            {children}
            {active && currentStep && spotlightRect
                ? createPortal(
                      <>
                          <TourOverlay rect={spotlightRect} />
                          <TourStepPopover
                              step={currentStep}
                              stepIndex={stepIndex}
                              rect={spotlightRect}
                              busy={busy}
                              onPrevious={() => goToStep(stepIndex - 1)}
                              onPrimary={handlePrimary}
                              onSkip={() => void finishTour()}
                          />
                      </>,
                      document.body,
                  )
                : null}
        </TourContext.Provider>
    );
}

export default TourProvider;
