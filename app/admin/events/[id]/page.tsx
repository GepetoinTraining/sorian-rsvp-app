import { prisma } from '@/app/lib/prisma';
import { Container } from '@mantine/core';
import { EventHeader } from '@/app/components/EventHeader';
import { EventDetails } from '@/app/components/EventDetails';
import { ConceptualMenu } from '@/app/components/ConceptualMenu';
// FIX: Updated import path to point to the correct location of RsvpForm
import RsvpForm from '@/app/event/[id]/RsvpForm'; 

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
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ name?: string }> 
}) {
  // 1. Await the promises
  const { id } = await params;
  const { name } = await searchParams;

  // 2. Now use the resolved ID
  const event = await getEvent(id);
  const preFilledName = name || "";

  if (!event) {
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
        hasPlusOne={event.hasPlusOne}
        initialName={preFilledName}
      />
    </Container>
  );
}