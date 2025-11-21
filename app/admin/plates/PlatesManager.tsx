'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updatePlate } from './actions';
import { 
  SimpleGrid, Card, Image, Text, Badge, Button, Group, Modal, 
  TextInput, Textarea, Stack, Checkbox, Box, LoadingOverlay, Alert,
  ActionIcon
} from '@mantine/core';
import { IconEdit, IconChefHat, IconCheck, IconSearch } from '@tabler/icons-react';
import { ImageUpload } from '@/app/components/ImageUpload';

// Define the type locally based on Prisma return
interface Plate {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ingredients: string | null;
  preparation: string | null;
  dietaryTags: string[];
  event: { name: string };
}

interface PlatesManagerProps {
  initialPlates: Plate[];
}

const DIETARY_OPTIONS = [
  { value: 'VEGAN', label: 'Vegano' },
  { value: 'VEGETARIAN', label: 'Vegetariano' },
  { value: 'GLUTEN_FREE', label: 'Sem Glúten' },
  { value: 'LACTOSE_FREE', label: 'Sem Lactose' },
  { value: 'CONTAINS_LACTOSE', label: 'Contém Lactose' },
  { value: 'CONTAINS_NUTS', label: 'Contém Nozes' },
];

export function PlatesManager({ initialPlates }: PlatesManagerProps) {
  const [search, setSearch] = useState('');
  const [editingPlate, setEditingPlate] = useState<Plate | null>(null);
  
  // Filter logic
  const filteredPlates = initialPlates.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.event.name.toLowerCase().includes(search.toLowerCase())
  );

  const [state, formAction, isPending] = useActionState(updatePlate as any, { success: false, message: null });

  // Close modal on success
  if (state.success && editingPlate) {
    // We need to rely on revalidatePath from action, but we can optimistically close
    // In a real app, we might want to wait, but for UX we'll close and let the list refresh
    if(!isPending) {
       // Small hack: setTimeout to avoid flicker if state updates fast
       setTimeout(() => setEditingPlate(null), 100);
    }
  }

  return (
    <>
      <Group mb="lg">
        <TextInput 
          placeholder="Buscar por nome do prato ou evento..." 
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {filteredPlates.map(plate => (
          <Card key={plate.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={plate.imageUrl || "https://placehold.co/600x400?text=Prato"}
                height={160}
                alt={plate.title}
                fit="cover"
              />
            </Card.Section>

            <Stack mt="md" gap="xs">
                <Group justify="space-between">
                    <Text fw={600} lineClamp={1}>{plate.title}</Text>
                    <Badge size="xs" variant="light" color="gray">{plate.event.name}</Badge>
                </Group>
                
                <Text size="xs" c="dimmed" lineClamp={2}>
                    {plate.description || "Sem descrição."}
                </Text>

                <Group gap={4}>
                    {plate.dietaryTags.slice(0, 3).map(tag => (
                        <Badge key={tag} size="xs" variant="outline">{tag}</Badge>
                    ))}
                    {plate.dietaryTags.length > 3 && <Badge size="xs" variant="outline">+{plate.dietaryTags.length - 3}</Badge>}
                </Group>
            </Stack>

            <Button 
                fullWidth 
                mt="md" 
                variant="light" 
                color="blue" 
                leftSection={<IconEdit size={16} />}
                onClick={() => setEditingPlate(plate)}
            >
                Editar Receita
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {/* --- EDIT MODAL --- */}
      <Modal 
        opened={!!editingPlate} 
        onClose={() => setEditingPlate(null)}
        title="Editar Prato"
        size="lg"
        centered
      >
        {editingPlate && (
            <form action={formAction}>
                <input type="hidden" name="id" value={editingPlate.id} />
                <Stack gap="md" pos="relative">
                    <LoadingOverlay visible={isPending} overlayProps={{ radius: "sm", blur: 2 }} />
                    
                    {state.message && !state.success && (
                        <Alert color="red">{state.message}</Alert>
                    )}

                    <Group align="flex-start" grow>
                        <ImageUpload 
                            label="Foto do Prato"
                            value={editingPlate.imageUrl || ''}
                            onChange={(url) => setEditingPlate({ ...editingPlate, imageUrl: url })}
                        />
                        <TextInput 
                            label="Título" 
                            name="title" 
                            defaultValue={editingPlate.title} 
                            required 
                        />
                    </Group>

                    <Textarea 
                        label="Descrição (Card)" 
                        name="description" 
                        defaultValue={editingPlate.description || ''} 
                        minRows={2}
                    />

                    <Textarea 
                        label="Lista de Ingredientes" 
                        name="ingredients" 
                        placeholder="Ex: Tomate, Manjericão, Azeite..."
                        defaultValue={editingPlate.ingredients || ''} 
                        minRows={3}
                    />

                    <Textarea 
                        label="Modo de Preparo" 
                        name="preparation" 
                        placeholder="Passo a passo..."
                        defaultValue={editingPlate.preparation || ''} 
                        minRows={5}
                    />

                    <Box>
                        <Text size="sm" fw={500} mb="xs">Restrições Alimentares</Text>
                        {/* FIX: Removed 'name' from Group and added to Checkbox items */}
                        <Checkbox.Group 
                            defaultValue={editingPlate.dietaryTags}
                        >
                            <SimpleGrid cols={2} spacing="xs">
                                {DIETARY_OPTIONS.map(opt => (
                                    <Checkbox 
                                        key={opt.value} 
                                        value={opt.value} 
                                        label={opt.label}
                                        name="dietaryTags" 
                                    />
                                ))}
                            </SimpleGrid>
                        </Checkbox.Group>
                    </Box>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setEditingPlate(null)}>Cancelar</Button>
                        <Button type="submit" color="blue" leftSection={<IconCheck size={16} />}>Salvar Alterações</Button>
                    </Group>
                </Stack>
            </form>
        )}
      </Modal>
    </>
  );
}