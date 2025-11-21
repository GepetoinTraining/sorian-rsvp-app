// app/event/[id]/page.tsx
import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { EventHeader } from '@/app/components/EventHeader';
import { EventDetails } from '@/app/components/EventDetails';
import { ConceptualMenu } from '@/app/components/ConceptualMenu';
import { EventTimeline } from '@/app/components/EventTimeline'; // Import Timeline
import { LocationMap } from '@/app/components/LocationMap';     // Import Map
import { Container, Stack } from '@mantine/core';
import RsvpForm from './RsvpForm';

// Fetch event data using the "Admin Strategy" (Fetch all lists flat)
async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      // 1. Fetch sections 
      menuSections: {
        orderBy: { order: 'asc' }
      },
      // 2. Fetch ALL items flat
      menuItems: true,
      // 3. NEW: Fetch Timeline items
      timeline: {
        orderBy: { order: 'asc' }
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

  // --- MANUAL GROUPING (Matches Admin Logic) ---
  // 1. Map items to their defined sections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayMenuSections: any[] = event.menuSections.map(section => ({
    ...section,
    items: event.menuItems.filter(item => item.sectionId === section.id)
  }));

  // 2. Find orphaned items (General/No Section)
  const orphanItems = event.menuItems.filter(item => !item.sectionId);

  // 3. If there are orphans, add the virtual "General" section
  if (orphanItems.length > 0) {
    displayMenuSections.unshift({
      id: 'general-section',
      title: 'Menu',
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
            
            {/* 2. Key Details */}
            <EventDetails 
              dressCode={event.dressCode}
              locationInfo={event.locationAddress}
            />

            {/* 3. NEW: Timeline ("Dot-line-dot thingy") */}
            {event.timeline.length > 0 && (
                <EventTimeline items={event.timeline} />
            )}
            
            {/* 4. Menu */}
            {displayMenuSections.length > 0 && (
              <ConceptualMenu menuSections={displayMenuSections} />
            )}

            {/* 5. NEW: Location Map ("Leaflet address thingy") */}
            {/* We show this just above RSVP so people know where they are going before confirming */}
            <div id="location-section">
                <LocationMap 
                    address={event.locationAddress || "Local não informado"} 
                    lat={event.locationLat}
                    lng={event.locationLng}
                />
            </div>

            {/* 6. RSVP Form */}
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