// components/EventCardLink.tsx
'use client';

import {
    Card,
    Image,
    Stack,
    Group,
    Badge,
    Title,
    Text,
    Button,
} from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { Event } from '@prisma/client';

// We use the Prisma-generated type Event here
interface EventCardLinkProps {
    event: Event;
}

export function EventCardLink({ event }: EventCardLinkProps) {
    const href = `/event/${event.id}`;

    return (
        // This Client Component safely uses Link as a component prop
        <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            component={Link} // This line MUST be inside a 'use client' file
            href={href}
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
                    {/* FIX: Use locationAddress instead of locationInfo */}
                    {event.locationAddress && (
                        <Group gap={6}>
                          <IconMapPin size={16} color="gray" />
                          <Text size="xs" c="dimmed" lineClamp={1}>{event.locationAddress}</Text>
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
    );
}