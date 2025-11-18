import { prisma } from '@/app/lib/prisma';
import { Header } from '@/app/components/Header';
import { 
  Container, 
  Title, 
  Table, 
  Group, 
  Text, 
  Card, 
  Badge, 
  Stack,
  ThemeIcon 
} from '@mantine/core';
import { BackButton } from '@/app/components/BackButton'; // Using the component we just fixed
import { IconArrowLeft, IconUsers, IconCalendarStats } from '@tabler/icons-react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Helper to format dates consistently
const formatDate = (dateStr: string) => {
  // Append time to prevent timezone shifts (as seen in your other components)
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  // 1. Security Check
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const { id } = await params;

  // 2. Fetch Event + RSVPs
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

  // 3. Calculate Stats
  // Total heads = Primary guests + (Plus Ones if applicable)
  const totalGuests = event.rsvps.reduce((acc, rsvp) => {
    return acc + 1 + (rsvp.bringingGuest ? 1 : 0);
  }, 0);

  return (
    <>
      <Header />
      <Container size="lg" py="xl">
        
        {/* Navigation */}
        <Group mb="lg">
          <BackButton 
            href="/admin/dashboard" 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
          >
            Voltar ao Dashboard
          </BackButton>
        </Group>

        {/* Page Header */}
        <Group justify="space-between" align="flex-end" mb="xl">
          <Stack gap="xs">
            <Title order={2}>{event.name}</Title>
            <Text c="dimmed">Gerenciamento de Lista de Presença (RSVP)</Text>
          </Stack>
        </Group>

        {/* Statistics Cards */}
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

        {/* RSVP List Table */}
        <Card withBorder radius="md" shadow="sm">
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome Principal</Table.Th>
                <Table.Th>Acompanhante (+1)</Table.Th>
                <Table.Th>Datas Disponíveis</Table.Th>
                <Table.Th>Confirmado Em</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {event.rsvps.length > 0 ? (
                event.rsvps.map((rsvp) => (
                  <Table.Tr key={rsvp.id}>
                    <Table.Td>
                      <Text fw={600} c="gray.9">{rsvp.guestName}</Text>
                    </Table.Td>
                    
                    <Table.Td>
                      {rsvp.bringingGuest ? (
                        <Group gap="xs">
                          <Badge color="green" size="sm" variant="light">Sim</Badge>
                          <Text size="sm">{rsvp.plusOneName}</Text>
                        </Group>
                      ) : (
                        <Badge color="gray" size="sm" variant="outline">Não</Badge>
                      )}
                    </Table.Td>

                    <Table.Td>
                      <Group gap={4}>
                        {rsvp.selectedDates.map((date) => (
                          <Badge key={date} variant="dot" color="gray">
                            {formatDate(date)}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(rsvp.createdAt).toLocaleDateString('pt-BR', {
                           day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' 
                        })}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Stack align="center" py="xl">
                      <Text c="dimmed">Nenhuma confirmação recebida ainda.</Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
}