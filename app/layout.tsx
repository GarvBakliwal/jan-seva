import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import './globals.css';
import { NavigationProvider } from '@/components/NavigationProvider';
import { getSession } from '@/lib/auth/get-session';

const notoSans = Noto_Sans({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Jan Seva — Civic Issue Reporting Portal',
    template: '%s | Jan Seva',
  },
  description:
    'Jan Seva allows citizens to report local civic issues such as potholes, garbage, streetlights, water leakage and more. A Smart India Hackathon 2025 project.',
  keywords: ['civic issues', 'complaint portal', 'India', 'government', 'SIH 2025', 'Jan Seva'],
  openGraph: {
    title: 'Jan Seva — Civic Issue Reporting Portal',
    description: 'Report civic issues. Improve your community.',
    type: 'website',
  },
  icons: {
    icon: '/images/jan-seva-official-seal.svg',
    shortcut: '/images/jan-seva-official-seal.svg',
    apple: '/images/jan-seva-official-seal.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={notoSans.variable}>
      <body className="flex flex-col min-h-screen">
        <NavigationProvider role={session?.profile.role}>
          {children}
        </NavigationProvider>
      </body>
    </html>
  );
}
