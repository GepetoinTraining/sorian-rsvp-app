import { prisma } from '@/app/lib/prisma';
import { Container, Title, Text, Paper } from '@mantine/core';
import { EventHeader } from '@/app/components/EventHeader';
import { EventDetails } from '@/app/components/EventDetails';
import { ConceptualMenu } from '@/app/components/ConceptualMenu';
import RsvpForm from './RsvpForm';

// Helper to get event
async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: { menuItems: true } // Include menu for display
  });
}

export default async function EventPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { name?: string } 
}) {
  const event = await getEvent(params.id);
  const preFilledName = searchParams.name || "";

  if (!event) {
     // ... 404 view ...
     return <div>Evento não encontrado</div>;
  }

  return (
    <Container size="md" py="xl">
      <EventHeader 
        title={event.name} 
        description={event.description || ""} 
      />
      
      <EventDetails 
        dressCode={event.dressCode}
        locationInfo={event.locationInfo}
      />
      
      {event.menuItems.length > 0 && (
         <ConceptualMenu menu={event.menuItems} />
      )}
      
      <RsvpForm 
        eventId={event.id}
        availableDates={event.availableDates}
        hasPlusOne={event.hasPlusOne} // Pass the setting
        initialName={preFilledName}   // Pass the name from QR code
      />
    </Container>
  );
}