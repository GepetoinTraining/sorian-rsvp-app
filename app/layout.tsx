// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import Providers from './providers';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth'; // Import this
import { authOptions } from '@/app/lib/auth'; // Import your auth options

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch session on the server
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-br">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body className={inter.className}>
        {/* Pass the session prop here */}
        <Providers session={session}>
          <MantineProvider theme={theme}>
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}