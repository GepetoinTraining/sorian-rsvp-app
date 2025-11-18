// app/page.tsx
import { Header } from '@/app/components/Header';
import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';

export default function Home() {
  return (
    <>
      <Header />
      <Container size="md" style={{ paddingTop: '6rem', paddingBottom: '6rem', minHeight: '80vh' }}>
        <Stack gap="xl" align="center">
          <Title
            order={1}
            ta="center"
            style={{ fontSize: '3.5rem', lineHeight: 1.1, fontFamily: 'var(--font-playfair), serif' }}
          >
            Sorian-RSVP: Experiências de Design
          </Title>

          <Text size="xl" c="dimmed" ta="center" maw={600}>
            Sua porta de entrada para eventos exclusivos. 
            Confirme sua presença ou gerencie seus convites.
          </Text>

          <Group mt="lg">
            <Button
              component={Link}
              href="/events" // Link to the new event listing page
              size="lg"
              rightSection={<IconArrowRight size={16} />}
              color="red"
            >
              Ver Eventos Abertos
            </Button>
            <Button
              component={Link}
              href="/auth/login"
              size="lg"
              variant="default"
            >
              Área Admin
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
}