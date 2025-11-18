// app/page.tsx
import { prisma } from '@/app/lib/prisma';
import { Header } from '@/app/components/Header';
import { 
  Container, 
  Title, 
  Text, 
  SimpleGrid, 
  Button, 
  Group, 
  Stack,
} from '@mantine/core';
import Link from 'next/link';
import { EventCardLink } from '@/app/components/EventCardLink'; 
import type { Event } from '@prisma/client'; // <-- THE FIX: Import type explicitly

// Fetch data on the server
async function getEvents(): Promise<Event[]> {
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
              <EventCardLink key={event.id} event={event} /> 
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