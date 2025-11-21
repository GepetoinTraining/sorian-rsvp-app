import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { EventCreator } from '@/app/admin/events/new/EventCreator'; 
import { Container, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Header } from '@/app/components/Header';
import { BackButton } from '@/app/components/BackButton'; 

async function getEventForEdit(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { 
      id: eventId,
    },
    include: {
      // FIX 1: Fetch menuSections to prevent the crash
      menuSections: {
        orderBy: { order: 'asc' }
      },
      menuItems: true,
      speakers: true,
      timeline: {
        orderBy: { order: 'asc' }
      },
      participants: true,
    }
  });

  return event;
}

export default async function EditEventPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/admin/dashboard');
  }

  const { id } = await params;

  const event = await getEventForEdit(id, session.user.id);

  if (!event) {
    notFound();
  }

  // Transform data for the form
  const initialData = {
    name: event.name,
    description: event.description || "",
    dressCode: event.dressCode || "",
    
    // FIX 2: Map to new schema fields (locationAddress, locationLat, locationLng)
    locationAddress: event.locationAddress || "", 
    locationLat: event.locationLat || null,
    locationLng: event.locationLng || null,
    
    imageUrl: event.imageUrl || "",
    hasPlusOne: event.hasPlusOne,
    availableDates: event.availableDates,

    // FIX 3: Map Menu Sections correctly
    menuSections: event.menuSections.map(s => ({
      id: s.id, // Pass ID so Creator can map it to tempId
      title: s.title,
      imageUrl: s.imageUrl || "",
      order: s.order
    })),

    // FIX 4: Pass sectionId explicitly (NOT sectionTempId) so EventCreator can map it
    menuItems: event.menuItems.map(i => ({ 
      title: i.title, 
      description: i.description || "", 
      imageUrl: i.imageUrl || "",
      sectionId: i.sectionId || null 
    })),

    speakers: event.speakers.map(s => ({
      name: s.name,
      role: s.role || "",
      bio: s.bio || "",
      imageUrl: s.imageUrl || "" 
    })),
    timeline: event.timeline.map(t => ({
      time: t.time,
      title: t.title,
      description: t.description || "",
      order: t.order
    })),
    participants: event.participants.map(p => ({
      name: p.name
    }))
  };

  return (
    <>
      <Header />
      <Container size="lg" py="xl">
        <Group mb="lg">
          <BackButton 
            href="/admin/dashboard" 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16}/>}
          >
            Cancelar e Voltar
          </BackButton>
        </Group>
        
        <EventCreator eventId={event.id} initialData={initialData} />
      </Container>
    </>
  );
}