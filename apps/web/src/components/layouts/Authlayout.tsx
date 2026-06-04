import { TroottLogo } from '../shared/app/troot-logo';
import { Copyright } from '../ui/copyright';
import type { IAuthLayout } from '@/utils/interfaces.util';

export function AuthLayout(data: IAuthLayout) {
    const {
        children,
        title,
        description,
        showLogo = true,
        showCopyright = true,
        maxWidth = 'xs',
        backgroundImage = '/public/images/assets/troott-o.png',
        className = '',
        hideHeaderOnSuccess = false,
    } = data;

    const maxWidthClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    return (
        <div className={`grid min-h-svh lg:grid-cols-2 ${className}`}>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                {showLogo && (
                    <div className="flex justify-center gap-2 md:justify-start">
                        <a
                            href="#"
                            className="flex items-center gap-2 font-medium"
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <TroottLogo className="size-4" />
                            </div>
                            Troott
                        </a>
                    </div>
                )}

                <div className="flex flex-1 items-center justify-center">
                    <div className={`w-full ${maxWidthClasses[maxWidth]}`}>
                        {(title || description) && !hideHeaderOnSuccess && (
                            <div className="flex flex-col items-center gap-2 text-center mb-6">
                                {title && (
                                    <h1 className="text-2xl font-bold">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-balance text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>

                {showCopyright && (
                    <div className="flex justify-start">
                        <Copyright year={new Date().getFullYear()} company="Troott" />
                    </div>
                )}
            </div>

            <div className="relative hidden lg:sticky lg:top-0 lg:flex lg:h-svh flex-col items-start justify-center bg-gradient-to-b from-[#111111] to-[#000000] border-l border-white/10 p-12 overflow-hidden">
                <div className="">
                    <img
                        src={backgroundImage}
                        alt="Preview"
                        className="ml-[9%] mt-[25%] max-full-none rounded-lg self-end max-w-full shadow-2xl object-contain"
                    />
                    <div className=" pb-25 pl-[9%]">
                        <h2 className="text-2xl font-bold text-white">
                            Community-Oriented:
                        </h2>
                        <p className="text-gray-400 mt-2">
                            Empowering faith-driven creators & ministers to{' '}
                            <br /> share the gospel worldwide
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
