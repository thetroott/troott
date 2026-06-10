import { Check } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import OnboardingItems from '@/_data/onboarding';
import { cn } from '@/lib/utils';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import { useStudio } from '@/context/studio/useStudio';
import storage from '@/api/services/local-storage';
import cookieService from '@/api/services/cookies';
import {
    hubCompletedItemIds,
    ONBOARDING_STEP_TOUR,
    resolveOnboardingStep,
} from '@/utils/hub-onboarding.util';
import { clearLegacyOnboardingProgress } from '@/utils/get-started-local-storage.util';
import {
    resolveStudioTourLaunchPath,
    TOUR_SESSION_KEYS,
} from '@/components/shared/tour/tour-steps';
import { getStoredStudioCode } from '@/utils/studio-nav.util';
import {
    PATH_SEG_SERMONS_UPLOAD_FILE,
    studioUploadPath,
} from '@/routes/paths';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';
import { toast } from 'sonner';

const hubCtaClass =
    'h-8 min-h-8 rounded-sm px-4 font-matter text-sm leading-5 tracking-[0.14px]';

const hubActiveCtaClass =
    'bg-[#08ffdb] text-[#292929] hover:bg-[#07e8c9] disabled:opacity-50';

const hubCompletedOutlineClass =
    'border-[#08ffdb] bg-transparent text-[#08ffdb] opacity-100 hover:bg-transparent hover:text-[#08ffdb] disabled:opacity-100';

const GetStarted = () => {
    const navigate = useNavigate();
    const { userContext } = useContextType();
    const { minister, isLoading: ministerLoading } = useMinister();
    const { creator, isLoading: creatorLoading } = useCreator();
    const { studioCode: contextStudioCode } = useStudio();

    useEffect(() => {
        clearLegacyOnboardingProgress();
    }, []);

    const user = userContext.user as {
        onboard?: { step?: number };
        studioCode?: string | null;
    } | null;

    const userType =
        userContext.userType || cookieService.getUserType() || '';

    const onboardingStep = resolveOnboardingStep(
        userType,
        minister,
        creator,
        user,
    );

    const completedSteps = useMemo(
        () => hubCompletedItemIds(onboardingStep),
        [onboardingStep],
    );

    const progressPercentage =
        (completedSteps.length / OnboardingItems.length) * 100;

    const navigateToHubItem = (item: (typeof OnboardingItems)[number]) => {
        const studioCode =
            getStoredStudioCode() ||
            user?.studioCode?.trim() ||
            contextStudioCode?.trim() ||
            '';

        if (item.id === '3') {
            const tourPath = resolveStudioTourLaunchPath(
                studioCode || undefined,
            );
            if (tourPath) {
                navigate(tourPath);
                return;
            }
            toast.error(
                'Your studio is not ready yet. Finish earlier steps and try again.',
            );
            return;
        }

        if (item.id === '4') {
            const ut = normalizeUserType(userType);
            const profileLoading =
                (ut === UserType.MINISTER && ministerLoading) ||
                (ut === UserType.CREATOR && creatorLoading);
            if (profileLoading) {
                toast.error(
                    'Loading your profile. Try again in a moment.',
                );
                return;
            }
            if (onboardingStep < ONBOARDING_STEP_TOUR) {
                toast.error(
                    'Complete the studio tour before uploading your first sermon.',
                );
                return;
            }
            if (!studioCode) {
                toast.error(
                    'Your studio is not ready yet. Finish earlier steps and try again.',
                );
                return;
            }
            sessionStorage.removeItem(TOUR_SESSION_KEYS.pending);
            storage.setStudioCode(studioCode);
            navigate(studioUploadPath(studioCode, PATH_SEG_SERMONS_UPLOAD_FILE));
            return;
        }

        navigate(item.action as string);
    };

    return (
        <div className="p-20">
            <div className="space-y-6 p-15 border border-border rounded-md">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Get Started</h1>

                    <div className="flex items-center gap-4 w-full max-w-[281px]">
                        <span className="whitespace-nowrap font-matter text-xs leading-[18px] tracking-[0.24px] text-[#bdbdbd]">
                            {`${completedSteps.length}/${OnboardingItems.length} completed`}
                        </span>

                        <div
                            className="flex-1 h-1 rounded-md bg-[#9d9d9d] overflow-hidden"
                            role="progressbar"
                            aria-valuenow={completedSteps.length}
                            aria-valuemin={0}
                            aria-valuemax={OnboardingItems.length}
                            aria-label="Get started onboarding progress"
                        >
                            <div
                                className="h-full rounded-md bg-[#6f94b8] transition-all duration-300 ease-in-out"
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-4 ">
                    <h2 className="text-xl font-semibold">
                        Launch your first sermon
                    </h2>

                    <p className="text-muted-foreground">
                        Add the required information to verify your account and
                        avoid interruptions to sermon publishing.
                    </p>

                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-2 mt-12"
                    >
                        {OnboardingItems.map((item) => {
                            const isComplete = completedSteps.includes(
                                item.id,
                            );

                            return (
                                <AccordionItem
                                    value={item.id}
                                    key={item.id}
                                    className={cn(
                                        'has-focus-visible:border-ring has-focus-visible:ring-ring/50 rounded-md border px-6 outline-none last:border-b has-focus-visible:ring-[3px] transition-colors',
                                        'data-[state=open]:bg-accent',
                                    )}
                                >
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full gap-4 cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                {isComplete ? (
                                                    <Check
                                                        size={18}
                                                        className="shrink-0 text-[#08ffdb]"
                                                        aria-hidden
                                                    />
                                                ) : (
                                                    <item.icon
                                                        size={24}
                                                        className="opacity-60 text-muted-foreground"
                                                    />
                                                )}
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        isComplete
                                                            ? 'text-[#9d9d9d] font-normal'
                                                            : undefined,
                                                    )}
                                                >
                                                    {item.title}
                                                </span>
                                            </div>

                                            {isComplete ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    tabIndex={-1}
                                                    aria-disabled="true"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className={cn(
                                                        hubCtaClass,
                                                        hubCompletedOutlineClass,
                                                        'group-data-[state=open]:hidden min-w-[109px] pointer-events-none',
                                                    )}
                                                >
                                                    Completed
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigateToHubItem(item);
                                                    }}
                                                    className={cn(
                                                        hubCtaClass,
                                                        hubActiveCtaClass,
                                                        'group-data-[state=open]:hidden cursor-pointer',
                                                    )}
                                                >
                                                    {item.button}
                                                </Button>
                                            )}
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="text-muted-foreground pb-4 px-9">
                                        <hr className="border-border mb-4" />

                                        <p className="mb-4">{item.text}</p>

                                        <Button
                                            type="button"
                                            variant={isComplete ? 'outline' : 'default'}
                                            onClick={() => {
                                                if (!isComplete) {
                                                    navigateToHubItem(item);
                                                }
                                            }}
                                            disabled={isComplete}
                                            className={cn(
                                                hubCtaClass,
                                                isComplete
                                                    ? hubCompletedOutlineClass
                                                    : hubActiveCtaClass,
                                                'cursor-pointer',
                                            )}
                                        >
                                            {isComplete
                                                ? 'Completed'
                                                : item.button}
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            </div>
        </div>
    );
};

export default GetStarted;
