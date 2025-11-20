// app/components/ConceptualMenu.tsx
'use client';

import { Box, Title, SimpleGrid, Card, Image, Text, Stack, Divider, Group } from '@mantine/core';

interface MenuItem {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  section?: string | null;
}

interface ConceptualMenuProps {
  menu: MenuItem[];
}

export function ConceptualMenu({ menu }: ConceptualMenuProps) {
  // 1. Group items by section, preserving order of appearance
  const sections: { name: string; items: MenuItem[] }[] = [];
  const sectionMap = new Map<string, MenuItem[]>();

  menu.forEach((item) => {
    // Default to "General" (or empty string) if no section provided
    const sectionName = item.section || 'General'; 
    
    if (!sectionMap.has(sectionName)) {
      const newList: MenuItem[] = [];
      sectionMap.set(sectionName, newList);
      sections.push({ name: sectionName, items: newList });
    }
    sectionMap.get(sectionName)?.push(item);
  });

  return (
    <Box my="xl">
      <Title order={2} c="gray.9" ta="center" mb="xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>
        A Coleção: Um Estudo em Texturas
      </Title>

      <Stack gap={50}>
        {sections.map((section, secIndex) => (
          <Box key={secIndex}>
            {/* Only show section title if it's NOT "General" or if you explicitly want to show it */}
            {section.name !== 'General' && (
              <Group mb="lg" align="center">
                <Title order={3} size="h2" c="gray.8" fw={400} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  {section.name}
                </Title>
                <Divider style={{ flexGrow: 1 }} />
              </Group>
            )}

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {section.items.map((item, index) => (
                <Card key={`${secIndex}-${index}`} shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Image
                      src={item.imageUrl || "https://placehold.co/600x400?text=Prato"}
                      height={200}
                      alt={item.title}
                      fit="cover"
                    />
                  </Card.Section>
                  <Title order={3} fw={700} mt="md" fz="lg">{item.title}</Title>
                  <Text size="sm" c="dimmed" mt="xs">{item.description}</Text>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}