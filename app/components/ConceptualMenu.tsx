// app/components/ConceptualMenu.tsx
'use client';

import { Box, Title, SimpleGrid, Card, Image, Text, Stack, Divider } from '@mantine/core';

// Interfaces based on the new Prisma schema structure
interface MenuItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface MenuSection {
  id: string;
  title: string;
  imageUrl?: string | null;
  items: MenuItem[];
}

interface ConceptualMenuProps {
  // The prop is now an array of full section objects
  menuSections: MenuSection[];
}

export function ConceptualMenu({ menuSections }: ConceptualMenuProps) {

  // Filter out sections that have no items to avoid empty blocks
  const activeSections = menuSections.filter(section => section.items.length > 0);

  if (activeSections.length === 0) {
      return <Text c="dimmed" ta="center" my="xl">O menu ainda não foi definido.</Text>
  }

  return (
    <Box my="xl">
      <Title order={2} c="gray.9" ta="center" mb={50} style={{ fontFamily: 'var(--font-playfair), serif' }}>
        A Coleção: Um Estudo em Texturas
      </Title>

      <Stack gap={60}>
        {activeSections.map((section) => (
          <Box key={section.id}>
             {/* 1. Section Header Image (if exists) */}
             {section.imageUrl && (
                <Box mb="md" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <Image
                        src={section.imageUrl}
                        height={200} // Adjust height as needed for banner look
                        alt={section.title}
                        fit="cover"
                    />
                </Box>
             )}

            {/* 2. Section Title & Divider */}
             <Box mb="lg">
                <Title order={3} size="h2" c="gray.8" fw={400} style={{ fontFamily: 'var(--font-playfair), serif', textAlign: section.imageUrl ? 'left' : 'center' }}>
                  {section.title}
                </Title>
                <Divider mt="sm" />
             </Box>


            {/* 3. Menu Items Grid */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {section.items.map((item) => (
                <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
                  {item.imageUrl && (
                    <Card.Section>
                        <Image
                        src={item.imageUrl}
                        height={200}
                        alt={item.title}
                        fit="cover"
                        />
                    </Card.Section>
                  )}
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