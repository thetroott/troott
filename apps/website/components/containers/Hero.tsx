'use client';

import { RiPlayCircleFill, RiUploadCloudFill } from '@remixicon/react';
import { track } from '@vercel/analytics';
import { Button } from '../Button';
import HeroImage from '../ui/HeroImage';
import { useState } from 'react';
import Newsletter from '../NewsletterModal';

export default function HeroSection() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [role, setRole] = useState<'listener' | 'minister'>('listener');

    return (
        <>
            <section className="mt-32 flex flex-col items-center justify-center text-center sm:mt-40">
                <h1
                    id="hero-title"
                    className="inline-block animate-slide-up-fade bg-gradient-to-br from-gray-50 to-gray-300 bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl"
                    style={{ animationDuration: '700ms' }}
                >
                    All the sermons you love in one place.
                </h1>

                <p
                    className="mt-6 max-w-lg animate-slide-up-fade text-lg text-gray-400"
                    style={{ animationDuration: '900ms' }}
                >
                    Find, listen and share powerful teachings from your
                    favourite ministers anytime, anywhere.
                </p>

                <div
                    className="mt-8 flex w-full animate-slide-up-fade flex-col justify-center gap-3 px-3 sm:flex-row"
                    style={{ animationDuration: '1100ms' }}
                >
                    <Button
                        className="h-14 px-8 group gap-x-2 font-normal md:h-12 md:px-6 text-base md:text-sm"
                        onClick={() => {
                            setRole('listener');
                            track('listenerSignup');
                            setDialogOpen(true);
                        }}
                    >
                        <span className="flex items-center gap-x-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-gray-800 transition-all group-hover:bg-gray-700">
                                <RiPlayCircleFill
                                    aria-hidden="true"
                                    className="size-4 shrink-0 text-gray-50"
                                />
                            </span>
                            Start listening
                        </span>
                    </Button>

                    <Button
                        variant="secondary"
                        className="group h-14 gap-x-2 bg-transparent px-8 font-normal hover:bg-transparent md:h-12 md:px-6"
                        onClick={() => {
                            setRole('minister');
                            track('ministerSignup');
                            setDialogOpen(true);
                        }}
                    >
                        <span className="flex size-6 items-center justify-center rounded-full bg-gray-800 transition-all group-hover:bg-gray-700">
                            <RiUploadCloudFill
                                aria-hidden="true"
                                className="size-4 shrink-0 text-gray-50"
                            />
                        </span>
                        Upload your sermons
                    </Button>
                </div>

                <div
                    className="relative mx-auto ml-3 mt-20 h-fit w-[40rem] max-w-6xl animate-slide-up-fade sm:ml-auto sm:w-full sm:px-2"
                    style={{ animationDuration: '1400ms' }}
                >
                    <HeroImage />
                    <div
                        className="absolute inset-x-0 -bottom-20 -mx-10 h-2/4 bg-gradient-to-t from-background via-background to-transparent lg:h-1/4"
                        aria-hidden="true"
                    />
                </div>
                <Newsletter
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    user_type={role}
                />
            </section>
        </>
    );
}
