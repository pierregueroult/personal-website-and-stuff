import { Fragment } from 'react';

import ProjectSlider from '@/components/projects/slider';

export default function Home() {
  return (
    <Fragment>
      <section className="flex h-screen flex-col">
        <p>I am a</p>
        <h1>Software Engineer</h1>
        <p>and also a CS student</p>
        <div>
          <div>
            <p>Spotify live activity</p>
            <p>Twitch live activity</p>
            <p>Wakatime month metric</p>
            <p>Github month metric</p>
          </div>
          <div>
            <p>contact@pierregueroult.dev</p>
            <p>Paris, France [HH:mm:ss]</p>
            <p>c pierregueroult.dev</p>
          </div>
        </div>
      </section>
      <section className="min-h-screen">
        <div>
          <h2>Skills</h2>
          <ul>
            <li>
              <h3>Web development</h3>
              <ul>
                <li>React</li>
                <li>Next.js</li>
                <li>Node.js</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
              </ul>
            </li>
            <li>
              <h3>Languages</h3>
              <ul>
                <li>English</li>
                <li>French</li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <section className="py-16">{/* <ProjectSlider /> */}</section>
    </Fragment>
  );
}
