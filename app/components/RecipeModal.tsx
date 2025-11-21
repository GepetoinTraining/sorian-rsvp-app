'use client';

import { Modal, Box, Image, Stack, Title, Group, Divider, Text, Badge } from '@mantine/core';
import { 
  IconLeaf, 
  IconMilk, 
  IconMilkOff, 
  IconSeeding, 
  IconWheatOff, 
  IconChefHat, 
  IconList 
} from '@tabler/icons-react';

// We define the specific subset of data this component needs
export interface RecipeModalProps {
  opened: boolean;
  onClose: () => void;
  item: {
    title: string;
    imageUrl?: string | null;
    ingredients?: string | null;
    preparation?: string | null;
    dietaryTags: string[];
  } | null;
}

// Helper for badges (internal to this component)
const getDietaryBadge = (tag: string) => {
  switch (tag) {
    case 'VEGAN':
      return <Badge color="green" leftSection={<IconSeeding size={12}/>}>Vegano</Badge>;
    case 'VEGETARIAN':
      return <Badge color="lime" leftSection={<IconLeaf size={12}/>}>Vegetariano</Badge>;
    case 'GLUTEN_FREE':
      return <Badge color="orange" leftSection={<IconWheatOff size={12}/>}>Sem Glúten</Badge>;
    case 'LACTOSE_FREE':
      return <Badge color="cyan" leftSection={<IconMilkOff size={12}/>}>Sem Lactose</Badge>;
    case 'CONTAINS_LACTOSE':
      return <Badge color="blue" variant="outline" leftSection={<IconMilk size={12}/>}>Contém Lactose</Badge>;
    default:
      return <Badge color="gray">{tag}</Badge>;
  }
};

export function RecipeModal({ opened, onClose, item }: RecipeModalProps) {
  if (!item) return null;

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="lg" 
      centered
      padding={0}
      withCloseButton={false} 
      radius="md"
    >
      <Box>
        {/* Modal Header Image */}
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            height={300}
            alt={item.title}
            fit="cover"
          />
        )}
        
        <Box p="xl">
          <Stack gap="lg">
            {/* Title & Tags */}
            <div>
              <Title order={2} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {item.title}
              </Title>
              {item.dietaryTags.length > 0 && (
                <Group gap="xs" mt="xs">
                  {item.dietaryTags.map(tag => (
                    <Box key={tag}>{getDietaryBadge(tag)}</Box>
                  ))}
                </Group>
              )}
            </div>

            <Divider />

            {/* Ingredients */}
            {item.ingredients && (
              <Box>
                <Group gap="xs" mb="xs">
                  <IconList size={20} color="gray" />
                  <Text fw={600} tt="uppercase" size="sm" c="dimmed">Ingredientes</Text>
                </Group>
                <Text style={{ whiteSpace: 'pre-line' }}>{item.ingredients}</Text>
              </Box>
            )}

            {/* Preparation */}
            {item.preparation && (
              <Box>
                <Group gap="xs" mb="xs">
                  <IconChefHat size={20} color="gray" />
                  <Text fw={600} tt="uppercase" size="sm" c="dimmed">Modo de Preparo</Text>
                </Group>
                <Text style={{ whiteSpace: 'pre-line' }}>{item.preparation}</Text>
              </Box>
            )}

            {/* Fallback */}
            {!item.ingredients && !item.preparation && (
              <Text c="dimmed" fs="italic" ta="center">
                Detalhes da receita não disponíveis para este prato.
              </Text>
            )}
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
}