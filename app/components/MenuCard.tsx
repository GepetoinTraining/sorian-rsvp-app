'use client';

import { Card, Image, Text, Stack, Group, Title } from '@mantine/core';
import { IconSeeding, IconLeaf } from '@tabler/icons-react';

export interface MenuCardProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    dietaryTags: string[];
    // Pass other props if needed, but this is enough for the card
  };
  onClick: () => void;
}

export function MenuCard({ item, onClick }: MenuCardProps) {
  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
      className="hover:shadow-md"
      onClick={onClick}
    >
      {item.imageUrl && (
        <Card.Section>
            <Image src={item.imageUrl} height={200} alt={item.title} fit="cover" />
        </Card.Section>
      )}
      
      <Stack gap={4} mt="md">
        <Group justify="space-between" align="flex-start">
          <Title order={3} fw={700} fz="lg">{item.title}</Title>
          
          {/* Mini Icons for quick scanning */}
          <Group gap={4}>
            {item.dietaryTags.includes('VEGAN') && (
                <IconSeeding size={18} color="green" title="Vegano" />
            )}
            {!item.dietaryTags.includes('VEGAN') && item.dietaryTags.includes('VEGETARIAN') && (
                <IconLeaf size={18} color="lightgreen" title="Vegetariano" />
            )}
          </Group>
        </Group>
        
        <Text size="sm" c="dimmed" lineClamp={2}>
          {item.description}
        </Text>
        
        <Text size="xs" c="red.7" fw={500} mt="sm">
          Ver Receita Completa &rarr;
        </Text>
      </Stack>
    </Card>
  );
}