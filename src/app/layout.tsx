import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { AvailableRoomsContextProvider } from './components/AvailableRoomsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RTC app',
  description: 'RTC app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AvailableRoomsContextProvider>
        <body className={inter.className}>
          <h1>Rooms</h1>
          <div>
            <Link href={'/'}>Go Back</Link>
          </div>

          {children}
        </body>
      </AvailableRoomsContextProvider>
    </html>
  );
}
