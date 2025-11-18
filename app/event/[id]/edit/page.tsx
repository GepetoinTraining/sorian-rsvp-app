import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
// We use relative path to be safe if alias fails
import { EventCreator } from '@/app/admin/events/new/EventCreator'; 
import { Container, Button, Group } from '@mantine/core';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { Header } from '@/app/components/Header';

async function getEventForEdit(eventId: string, userId: string) {
  console.log(`[EditPage] Searching for Event ID: ${eventId}`);

  // TEMPORARY FIX: Remove the 'userId' check inside the where clause
  const event = await prisma.event.findUnique({
    where: { 
      id: eventId,
      // userId: userId  <-- COMMENT THIS OUT so you can edit ANY event
    },
    include: {
      menuItems: true,
      speakers: true,
      timeline: true,
      participants: true,
    }
  });

  // Add logging to see what happened
  if (!event) {
    console.error(`[EditPage] Event NOT found in DB.`);
  } else {
    console.log(`[EditPage] Event Found! Owner: ${event.userId}, Current User: ${userId}`);
  }

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

  // Await params for Next.js 15+
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
    locationInfo: event.locationInfo || "",
    imageUrl: event.imageUrl || "",
    hasPlusOne: event.hasPlusOne, // This allows you to toggle the +1 form!
    availableDates: event.availableDates,
    menuItems: event.menuItems.map(i => ({ 
      title: i.title, 
      description: i.description || "", 
      imageUrl: i.imageUrl || "" 
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
          <Button 
            component={Link} 
            href="/admin/dashboard" 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16}/>}
          >
            Cancelar e Voltar
          </Button>
        </Group>
        
        <EventCreator eventId={event.id} initialData={initialData} />
      </Container>
    </>
  );
}