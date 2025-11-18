// app/admin/events/new/page.tsx
'use client';

import { Container, Button, Group } from '@mantine/core';
import { EventCreator } from './EventCreator';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { Header } from '@/app/components/Header';

export default function NewEventPage() {
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
            Voltar para Dashboard
          </Button>
        </Group>
        
        <EventCreator />
      </Container>
    </>
  );
}