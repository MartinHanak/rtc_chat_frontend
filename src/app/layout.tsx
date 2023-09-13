import './globals.css';
import type { Metadata } from 'next';

import ThemeRegistry from './components/Theme/ThemeRegistry';
import { AvailableRoomsContextProvider } from './components/AvailableRoomsContext';

import { Container } from '@mui/material';

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
      <body>
        <ThemeRegistry>
          <AvailableRoomsContextProvider>

            <Container>
              {children}
            </Container>

          </AvailableRoomsContextProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
