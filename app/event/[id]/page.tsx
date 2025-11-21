// app/event/[id]/page.tsx
import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { EventHeader } from '@/app/components/EventHeader';
import { EventDetails } from '@/app/components/EventDetails';
import { ConceptualMenu } from '@/app/components/ConceptualMenu';
import { Container, Stack } from '@mantine/core';
import RsvpForm from './RsvpForm';

// Fetch event data using the "Admin Strategy" (Fetch all lists flat)
async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      // 1. Fetch sections (No nested items, just the headers)
      menuSections: {
        orderBy: {
          order: 'asc'
        }
      },
      // 2. Fetch ALL items flat (This guarantees we get everything)
      menuItems: true
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

  // --- MANUAL GROUPING (Matches Admin Logic) ---
  // 1. Map items to their defined sections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayMenuSections: any[] = event.menuSections.map(section => ({
    ...section,
    // Manually find items that belong to this section
    items: event.menuItems.filter(item => item.sectionId === section.id)
  }));

  // 2. Find orphaned items (General/No Section)
  const orphanItems = event.menuItems.filter(item => !item.sectionId);

  // 3. If there are orphans, add the virtual "General" section at the top
  if (orphanItems.length > 0) {
    displayMenuSections.unshift({
      id: 'general-section', // Virtual ID
      title: 'Menu',         // Generic title for general items
      imageUrl: null,
      items: orphanItems,
      order: -1
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
              locationInfo={event.locationAddress}
            />
            
            {/* 3. Menu (Using Manually Grouped Sections) */}
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