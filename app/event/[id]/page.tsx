// app/event/[id]/page.tsx
import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { EventHeader } from '@/app/components/EventHeader';
import { EventDetails } from '@/app/components/EventDetails';
import { ConceptualMenu } from '@/app/components/ConceptualMenu';
import { Container, Stack } from '@mantine/core';
import RsvpForm from './RsvpForm';

// Fetch specific event data with all relations
async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      // 1. Fetch defined sections with their items
      menuSections: {
        include: {
          items: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      // 2. NEW: Fetch orphaned items (General/No Section)
      menuItems: {
        where: {
          sectionId: null
        }
      }
    }
  });
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { name } = await searchParams;

  const event = await getEvent(id);

  if (!event) {
    return notFound();
  }

  // Handle guest name from QR code/URL parameter
  const guestName = typeof name === 'string' ? name : '';

  // --- PREPARE MENU DISPLAY ---
  // Clone the sections to a mutable array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayMenuSections: any[] = [...event.menuSections];

  // If there are items without a section, wrap them in a virtual "General" section
  if (event.menuItems.length > 0) {
    displayMenuSections.unshift({
      id: 'general-section', // Virtual ID
      title: 'Menu',         // Generic title for general items
      imageUrl: null,
      items: event.menuItems,
      order: -1              // Ensure it's handled first conceptually
    });
  }

  return (
    <>
      <Header />
      
      <main>
        <Container size="lg" py="xl">
          <Stack gap="xl">
            {/* 1. Title & Description */}
            <EventHeader 
              title={event.name} 
              description={event.description || ''} 
            />
            
            {/* 2. Key Details (Date, Location, Dress Code) */}
            <EventDetails 
              dressCode={event.dressCode}
              // FIX: Use new locationAddress field
              locationInfo={event.locationAddress}
            />
            
            {/* 3. Menu (Using Sections + Orphans) */}
            {displayMenuSections.length > 0 && (
              <ConceptualMenu menuSections={displayMenuSections} />
            )}

            {/* 4. RSVP Form */}
            <div id="rsvp-section">
               <RsvpForm 
                 eventId={event.id} 
                 availableDates={event.availableDates}
                 hasPlusOne={event.hasPlusOne}
                 initialName={guestName}
               />
            </div>
          </Stack>
        </Container>
      </main>
    </>
  );
}