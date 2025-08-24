import ProjectSlider from '@/components/projects/slider';
import { Fragment } from 'react';

export default function Home() {
  return (
    <Fragment>
      <section className="flex h-screen flex-col">
       here is the name, location, menu, cta, live activity ... 
      </section>
      <section className="min-h-screen">
        here is the resume with skills education experience ...
      </section>
      <section className="min-h-screen">
        <ProjectSlider />
      </section>
    </Fragment>
  );
}
