// app/event/[id]/page.tsx
import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { EventHeader } from '@/app/components/EventHeader';
import { EventDetails } from '@/app/components/EventDetails';
import { ConceptualMenu } from '@/app/components/ConceptualMenu';
import { Container, Stack, Text } from '@mantine/core';
import RsvpForm from './RsvpForm';

// Fetch specific event data
async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      menuItems: true,
      // Add other relations like speakers/timeline here if you create components for them
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
              locationInfo={event.locationInfo}
            />
            
            {/* 3. Menu (If items exist) */}
            {event.menuItems.length > 0 && (
              <ConceptualMenu menu={event.menuItems} />
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