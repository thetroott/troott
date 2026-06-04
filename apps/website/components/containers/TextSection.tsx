import React from 'react';
import ScrollBaseAnimation from '../ui/TextMarquee';

function TextSection() {
    return (
        <>
            <div className="grid h-[220px] place-content-center text-white sm:mt-16 md:h-[500px]">
                <ScrollBaseAnimation
                    delay={500}
                    baseVelocity={-3}
                    clasname="sm:text-7xl! font-bold tracking-[-0.07em] leading-[90%]"
                >
                    Play and listen to sermons
                </ScrollBaseAnimation>
                <ScrollBaseAnimation
                    delay={500}
                    baseVelocity={3}
                    clasname="sm:text-7xl! font-bold tracking-[-0.07em] leading-[90%]"
                >
                    Share it if you like it
                </ScrollBaseAnimation>
            </div>
        </>
    );
}

export default TextSection;
