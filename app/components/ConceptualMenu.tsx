'use client';

import { useState } from 'react';
import { Box, Title, SimpleGrid, Image, Text, Stack, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MenuCard } from './MenuCard';
import { RecipeModal } from './RecipeModal';

// Define the full interface here or import from a shared types file
interface MenuItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  ingredients?: string | null;
  preparation?: string | null;
  dietaryTags: string[];
}

interface MenuSection {
  id: string;
  title: string;
  imageUrl?: string | null;
  items: MenuItem[];
}

interface ConceptualMenuProps {
  menuSections: MenuSection[];
}

export function ConceptualMenu({ menuSections }: ConceptualMenuProps) {
  const activeSections = menuSections.filter(section => section.items.length > 0);
  
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleCardClick = (item: MenuItem) => {
    setSelectedItem(item);
    open();
  };

  if (activeSections.length === 0) {
      return <Text c="dimmed" ta="center" my="xl">O menu ainda não foi definido.</Text>
  }

  return (
    <>
      {/* The Reusable Modal */}
      <RecipeModal 
        opened={opened} 
        onClose={close} 
        item={selectedItem} 
      />

      {/* The Menu List */}
      <Box my="xl">
        <Title order={2} c="gray.9" ta="center" mb={50} style={{ fontFamily: 'var(--font-playfair), serif' }}>
          A Coleção: Um Estudo em Texturas
        </Title>

        <Stack gap={60}>
          {activeSections.map((section) => (
            <Box key={section.id}>
               {/* Section Header */}
               {section.imageUrl && (
                  <Box mb="md" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                      <Image src={section.imageUrl} height={200} alt={section.title} fit="cover" />
                  </Box>
               )}

               <Box mb="lg">
                  <Title order={3} size="h2" c="gray.8" fw={400} style={{ fontFamily: 'var(--font-playfair), serif', textAlign: section.imageUrl ? 'left' : 'center' }}>
                    {section.title}
                  </Title>
                  <Divider mt="sm" />
               </Box>

              {/* Grid of Reusable Cards */}
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                {section.items.map((item) => (
                  <MenuCard 
                    key={item.id} 
                    item={item} 
                    onClick={() => handleCardClick(item)} 
                  />
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
}