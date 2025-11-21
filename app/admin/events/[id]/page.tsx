import { prisma } from '@/app/lib/prisma';
import { Header } from '@/app/components/Header';
import { 
  Container, 
  Title, 
  Group, 
  Text, 
  Card, 
  Stack,
  ThemeIcon 
} from '@mantine/core';
import { BackButton } from '@/app/components/BackButton'; 
import { RsvpTable } from './RsvpTable'; 
import { IconArrowLeft, IconUsers, IconCalendarStats } from '@tabler/icons-react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      rsvps: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!event) {
    return notFound();
  }

  // Calculate Stats
  // FIX: Updated property from 'bringingGuest' to 'hasPlusOne'
  const totalGuests = event.rsvps.reduce((acc, rsvp) => {
    return acc + 1 + (rsvp.hasPlusOne ? 1 : 0);
  }, 0);

  // Prepare data: Format dates to strings on the SERVER
  const formattedRsvps = event.rsvps.map(rsvp => ({
    ...rsvp,
    confirmedAtFormatted: rsvp.createdAt.toLocaleString('pt-BR', {
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo' 
    })
  }));

  return (
    <>
      <Header />
      <Container size="lg" py="xl">
        
        <Group mb="lg">
          <BackButton 
            href="/admin/dashboard" 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
          >
            Voltar ao Dashboard
          </BackButton>
        </Group>

        <Group justify="space-between" align="flex-end" mb="xl">
          <Stack gap="xs">
            <Title order={2}>{event.name}</Title>
            <Text c="dimmed">Gerenciamento de Lista de Presença (RSVP)</Text>
          </Stack>
        </Group>

        <Group mb="xl" grow>
          <Card withBorder padding="md" radius="md">
            <Group>
              <ThemeIcon color="red" variant="light" size="lg" radius="md">
                <IconUsers size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total de Pessoas</Text>
                <Text size="xl" fw={700}>{totalGuests}</Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="md" radius="md">
            <Group>
              <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                <IconCalendarStats size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Confirmados (Entradas)</Text>
                <Text size="xl" fw={700}>{event.rsvps.length}</Text>
              </div>
            </Group>
          </Card>
        </Group>

        <Card withBorder radius="md" shadow="sm">
          <RsvpTable rsvps={formattedRsvps} />
        </Card>
      </Container>
    </>
  );
}