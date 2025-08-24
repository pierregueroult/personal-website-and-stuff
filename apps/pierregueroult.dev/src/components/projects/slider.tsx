'use client';

import { useEffect } from 'react';

import { useSmooothy } from '@/hooks/use-smoothy';

const slides = Array.from({ length: 10 }).map((_, i) => i);

export default function ProjectSlider() {
  const { ref, slider } = useSmooothy({
    infinite: true,
    snap: true,
  });

  useEffect(() => {
    console.log(slider);
  }, [slider]);

  return (
    <div
      className="py-sm pb-xl flex w-screen overflow-x-hidden px-[calc(50%-40vw)] md:px-[calc(50%-15vw)]"
      ref={ref}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className="flex aspect-[3/4] w-[80vw] shrink-0 items-center justify-center p-1 md:w-[30vw]"
        >
          <div className="relative h-full w-full p-8 outline outline-gray-800">
            <div className="h-full w-full outline outline-gray-600" />
            <p className="absolute left-2 top-2 z-10">{i}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
