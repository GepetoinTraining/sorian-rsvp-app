// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import Providers from './providers';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Sorian-RSVP',
  description: 'Gestão de eventos exclusivos.',
};

const theme = createTheme({
  fontFamily: inter.style.fontFamily,
  headings: { fontFamily: `var(--font-playfair), serif` },
  primaryColor: 'red',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body className={inter.className}>
        <Providers>
          <MantineProvider theme={theme}>
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}