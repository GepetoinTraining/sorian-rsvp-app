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
      menuItems: true,
      speakers: true,
      timeline: true,
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
    // FIX: Map to new schema fields (locationAddress, locationLat, locationLng)
    address: event.locationAddress || "", 
    latitude: event.locationLat || null,
    longitude: event.locationLng || null,
    
    imageUrl: event.imageUrl || "",
    hasPlusOne: event.hasPlusOne,
    availableDates: event.availableDates,
    menuItems: event.menuItems.map(i => ({ 
      title: i.title, 
      description: i.description || "", 
      imageUrl: i.imageUrl || "",
      // FIX: Include sectionId so the form knows which section this item belongs to
      sectionTempId: i.sectionId || null
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