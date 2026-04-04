import React from 'react';
import ScrollBaseAnimation from '../ui/TextMarquee';



function TextSection() {
  return (
    <>
      <div className='h-[220px] md:h-[500px] sm:mt-16 grid place-content-center  text-gray-600 dark:text-white'>
        <ScrollBaseAnimation
          delay={500}
          baseVelocity={-3}
          clasname='sm:text-7xl! font-bold tracking-[-0.07em] leading-[90%]'
        >
          Play and listen to sermons
        </ScrollBaseAnimation>
        <ScrollBaseAnimation
          delay={500}
          baseVelocity={3}
          clasname='sm:text-7xl! font-bold tracking-[-0.07em] leading-[90%]'
        >
          Share it if you like it
        </ScrollBaseAnimation>
      </div>
    </>
  );
}

export default TextSection;
