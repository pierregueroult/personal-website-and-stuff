'use client';

import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import Core, { CoreConfig } from 'smooothy';

export function useSmooothy(config: Partial<CoreConfig> = {}) {
  const sliderRef = useRef<HTMLElement | null>(null);
  const [slider, setSlider] = useState<Core | null>(null);

  const refCallback = (node: HTMLElement | null) => {
    if (node && !slider) {
      const instance = new Core(node, config);
      gsap.ticker.add(instance.update.bind(instance));
      setSlider(instance);
    }
    sliderRef.current = node;
  };

  useEffect(() => {
    return () => {
      if (slider) {
        gsap.ticker.remove(slider.update.bind(slider));
        slider.destroy();
      }
    };
  }, [slider]);

  return { ref: refCallback, slider };
}
