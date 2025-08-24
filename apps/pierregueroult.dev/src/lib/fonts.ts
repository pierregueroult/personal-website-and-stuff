import { JetBrains_Mono, Sora } from 'next/font/google';

const mainFont = JetBrains_Mono({ subsets: ['latin'], variable: '--font-main' });
const accentFont = Sora({ subsets: ['latin'], variable: '--font-accent' });

export { mainFont, accentFont };
