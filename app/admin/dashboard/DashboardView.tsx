'use client';

import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Card, 
  SimpleGrid, 
  Badge, 
  Stack,
  ActionIcon,
  ThemeIcon
} from '@mantine/core';
import { Header } from '@/app/components/Header';
import Link from 'next/link';
import { 
  IconPlus, 
  IconCalendarEvent, 
  IconUsers, 
  IconEye, 
  IconEdit 
} from '@tabler/icons-react';
import { Prisma } from '@prisma/client';
import { Session } from 'next-auth';

// Re-define or import the type
type EventWithRsvpCount = Prisma.EventGetPayload<{
  include: {
    _count: {
      select: { rsvps: true }
    }
  }
}>;

interface DashboardViewProps {
  events: EventWithRsvpCount[];
  session: Session;
}

export function DashboardView({ events, session }: DashboardViewProps) {
  return (
    <>
      <Header />
      <Container size="lg" py="xl">
        
        {/* Dashboard Header */}
        <Group justify="space-between" mb={40}>
          <Stack gap={0}>
            <Title order={2}>Painel de Controle</Title>
            <Text c="dimmed">Bem-vindo, {session.user?.name || 'Admin'}.</Text>
          </Stack>
          <Button 
            component={Link} 
            href="/admin/events/new" 
            size="md" 
            color="red"
            leftSection={<IconPlus size={20} />}
          >
            Criar Novo Evento
          </Button>
        </Group>

        {/* Stats Overview */}
        {events.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
            <Card withBorder radius="md" p="md">
              <Group>
                <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                  <IconCalendarEvent size={20} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total de Eventos</Text>
                  <Text fw={700} size="xl">{events.length}</Text>
                </div>
              </Group>
            </Card>
            <Card withBorder radius="md" p="md">
              <Group>
                <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                  <IconUsers size={20} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total de RSVPs</Text>
                  <Text fw={700} size="xl">
                    {events.reduce((acc, curr) => acc + curr._count.rsvps, 0)}
                  </Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>
        )}

        {/* Events List */}
        <Title order={3} mb="md">Seus Eventos</Title>
        
        {events.length === 0 ? (
          <Card withBorder padding="xl" radius="md" ta="center" bg="gray.0">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="white" color="gray">
                <IconCalendarEvent size={34} />
              </ThemeIcon>
              <Text size="lg" fw={500}>Você ainda não criou nenhum evento.</Text>
              <Text c="dimmed" maw={400}>
                Comece criando seu primeiro evento exclusivo para começar a receber confirmações de presença.
              </Text>
              <Button component={Link} href="/admin/events/new" variant="light" color="red">
                Criar Primeiro Evento
              </Button>
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {events.map((event) => (
              <Card key={event.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Badge color="gray" variant="light">
                    {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                  </Badge>
                  <Group gap="xs">
                     <ActionIcon 
                        component={Link} 
                        href={`/event/${event.id}`} 
                        variant="subtle" 
                        color="gray"
                        target="_blank"
                        title="Ver Página Pública"
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                      
                      <ActionIcon 
                        component={Link}
                        href={`/admin/events/${event.id}/edit`} 
                        variant="light" 
                        color="blue"
                        title="Editar"
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                  </Group>
                </Group>

                <Text fw={600} size="lg" lineClamp={1} mb="xs" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {event.name}
                </Text>

                <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                  {event.description || "Sem descrição."}
                </Text>

                <Card.Section inheritPadding py="xs" withBorder>
                  <Group justify="space-between">
                    <Group gap={5}>
                      <IconUsers size={16} color="gray" />
                      <Text size="sm" fw={500}>
                        {event._count.rsvps} <Text span c="dimmed" inherit>Confirmados</Text>
                      </Text>
                    </Group>
                    <Button 
                      component={Link} 
                      href={`/admin/events/${event.id}`} 
                      variant="subtle" 
                      size="xs"
                    >
                      Gerenciar Lista
                    </Button>
                  </Group>
                </Card.Section>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </>
  );
}