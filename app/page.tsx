// app/page.tsx
import { prisma } from '@/app/lib/prisma';
import { Header } from '@/app/components/Header';
import { 
  Container, 
  Title, 
  Text, 
  SimpleGrid, 
  Card, 
  Image, 
  Button, 
  Group, 
  Badge, 
  Stack 
} from '@mantine/core';
import Link from 'next/link';
import { IconMapPin } from '@tabler/icons-react';

// Fetch data on the server
async function getEvents() {
  return await prisma.event.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export default async function HomePage() {
  const events = await getEvents();

  return (
    <>
      <Header />
      
      <main>
        <Container size="lg" py="xl">
          {/* Hero Section */}
          <Stack align="center" gap="xs" my={50}>
            <Title 
              order={1} 
              fz={{ base: 36, sm: 48 }} 
              style={{ fontFamily: 'var(--font-playfair), serif' }}
              c="gray.9"
              ta="center"
            >
              Eventos Sorian
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={600}>
              Experiências exclusivas de design e conforto. 
              Selecione um evento para confirmar sua presença.
            </Text>
            <div style={{ width: 60, height: 4, backgroundColor: '#fa5252', marginTop: 20 }} />
          </Stack>

          {/* Events Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {events.map((event) => (
              <Card 
                key={event.id} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                component={Link}
                href={`/event/${event.id}`}
                className="hover:shadow-md transition-shadow duration-200"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Card.Section>
                  <Image
                    src={event.imageUrl || "https://placehold.co/600x400?text=Sorian"}
                    height={200}
                    alt={event.name}
                    fit="cover"
                  />
                </Card.Section>

                <Stack gap="xs" mt="md" mb="xs" style={{ flexGrow: 1 }}>
                  <Group justify="space-between">
                    <Badge color="red" variant="light">
                      Convite Aberto
                    </Badge>
                  </Group>
                  
                  <Title order={3} fz="xl" fw={600} lineClamp={2} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    {event.name}
                  </Title>
                  
                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {event.description || "Sem descrição disponível."}
                  </Text>
                </Stack>

                <Group gap="sm" mt="xl">
                  <Stack gap={4}>
                     {event.locationInfo && (
                        <Group gap={6}>
                          <IconMapPin size={16} color="gray" />
                          <Text size="xs" c="dimmed" lineClamp={1}>{event.locationInfo}</Text>
                        </Group>
                     )}
                  </Stack>
                </Group>

                <Button 
                  color="red" 
                  variant="filled"
                  fullWidth 
                  mt="md" 
                  radius="md"
                >
                  Ver Detalhes & RSVP
                </Button>
              </Card>
            ))}
          </SimpleGrid>
          
          {/* Empty State */}
          {events.length === 0 && (
            <Container size="sm" py={80}>
              <Text c="dimmed" ta="center" size="lg" mb="md">Nenhum evento encontrado.</Text>
              <Group justify="center">
                <Button component={Link} href="/auth/login" variant="subtle" color="gray">
                  Acesso Administrativo
                </Button>
              </Group>
            </Container>
          )}
        </Container>
      </main>
    </>
  );
}