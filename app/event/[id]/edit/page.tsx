import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
// FIX: Use the absolute alias '@' to locate the component reliably
import { EventCreator } from '@/app/admin/events/new/EventCreator'; 
import { Container, Button, Group } from '@mantine/core';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { Header } from '@/app/components/Header';

// Helper to fetch the specific event with all relations needed for the form
async function getEventForEdit(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { 
      id: eventId,
      userId: userId // Security: Ensure the user owns this event
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
  // 1. Check Authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/admin/dashboard');
  }

  // 2. Await params (Next.js 15 requirement)
  const { id } = await params;

  // 3. Fetch Data
  const event = await getEventForEdit(id, session.user.id);

  // 4. Handle 404 if event doesn't exist or belongs to another user
  if (!event) {
    notFound();
  }

  // 5. Transform Prisma data to match EventCreator's expected "initialData" shape
  const initialData = {
    name: event.name,
    description: event.description || "",
    dressCode: event.dressCode || "",
    locationInfo: event.locationInfo || "",
    imageUrl: event.imageUrl || "",
    hasPlusOne: event.hasPlusOne,
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
        
        {/* Pass eventId to trigger "Update Mode" and initialData to pre-fill form */}
        <EventCreator eventId={event.id} initialData={initialData} />
      </Container>
    </>
  );
}