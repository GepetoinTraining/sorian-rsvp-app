'use client';

import { Box, Title, SimpleGrid, Card, Image, Text } from '@mantine/core';

interface MenuItem {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface ConceptualMenuProps {
  menu: MenuItem[];
}

export function ConceptualMenu({ menu }: ConceptualMenuProps) {
  return (
    <Box my="xl">
      <Title order={2} c="gray.9" ta="center" mb="xl">A Coleção: Um Estudo em Texturas</Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {menu.map((item, index) => (
          <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={item.imageUrl || "https://placehold.co/600x400?text=Prato"}
                height={200}
                alt={item.title}
                fit="cover"
              />
            </Card.Section>
            <Title order={3} fw={700} mt="md">{item.title}</Title>
            <Text size="sm" c="dimmed" mt="xs">{item.description}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}