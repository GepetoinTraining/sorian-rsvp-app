'use client';

import { Timeline, Text, Title, Box, Paper } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

interface TimelineItemData {
  id: string;
  time: string;
  title: string;
  description: string | null;
}

interface EventTimelineProps {
  items: TimelineItemData[];
}

export function EventTimeline({ items }: EventTimelineProps) {
  if (!items || items.length === 0) return null;

  return (
    <Box my={50}>
        <Title order={2} c="gray.9" ta="center" mb="xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Programação
        </Title>
        <Paper withBorder shadow="sm" p="xl" radius="md">
            <Timeline active={items.length} bulletSize={24} lineWidth={2}>
                {items.map((item) => (
                    <Timeline.Item 
                        key={item.id} 
                        bullet={<IconClock size={12} />}
                        title={item.time}
                        lineVariant="dashed"
                    >
                        <Text c="gray.9" fw={600} size="lg">{item.title}</Text>
                        {item.description && (
                            <Text c="dimmed" size="sm" mt={4}>{item.description}</Text>
                        )}
                    </Timeline.Item>
                ))}
            </Timeline>
        </Paper>
    </Box>
  );
}