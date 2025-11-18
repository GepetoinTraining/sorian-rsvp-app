'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createEvent } from '@/app/admin/actions';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Paper,
  Title,
  Stack,
  Tabs,
  JsonInput,
  Alert,
  LoadingOverlay,
  ActionIcon,
  Text,
  Card,
  Grid,
  NumberInput,
  rem
} from '@mantine/core';
import { ImageUpload } from '@/app/components/ImageUpload';
import { DateSelector } from '@/app/components/DateSelector';
import { 
  IconCode, IconForms, IconAlertCircle, IconPlus, IconTrash, 
  IconClock, IconUser, IconToolsKitchen2, IconInfoCircle
} from '@tabler/icons-react';

// --- TYPES ---
interface MenuItem { title: string; description: string; imageUrl: string; }
interface Speaker { name: string; role: string; bio: string; imageUrl: string; }
interface TimelineItem { time: string; title: string; description: string; order: number; }

interface ActionState {
  success: boolean;
  message: string | null;
  errors?: { [key: string]: string[] | undefined; };
}

// --- INITIAL STATE ---
const INITIAL_EVENT = {
  name: "",
  description: "",
  dressCode: "",
  locationInfo: "",
  imageUrl: "",
  availableDates: [] as string[],
  menuItems: [] as MenuItem[],
  speakers: [] as Speaker[],
  timeline: [] as TimelineItem[],
};

export function EventCreator() {
  const [eventData, setEventData] = useState(INITIAL_EVENT);
  const [jsonString, setJsonString] = useState(JSON.stringify(INITIAL_EVENT, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEvent as any, 
    { success: false, message: null }
  );

  // --- SYNC HELPERS ---
  const updateState = (newData: typeof INITIAL_EVENT) => {
    setEventData(newData);
    setJsonString(JSON.stringify(newData, null, 2));
  };

  const handleFieldChange = (field: keyof typeof INITIAL_EVENT, value: any) => {
    updateState({ ...eventData, [field]: value });
  };

  const handleJsonChange = (value: string) => {
    setJsonString(value);
    try {
      const parsed = JSON.parse(value);
      setEventData(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError("JSON Inválido");
    }
  };

  // --- ARRAY HELPERS (Generic) ---
  const addItem = (field: 'menuItems' | 'speakers' | 'timeline', item: any) => {
    handleFieldChange(field, [...eventData[field], item]);
  };

  const removeItem = (field: 'menuItems' | 'speakers' | 'timeline', index: number) => {
    const newArr = eventData[field].filter((_, i) => i !== index);
    handleFieldChange(field, newArr);
  };

  const updateItem = (field: 'menuItems' | 'speakers' | 'timeline', index: number, key: string, val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArr = [...(eventData[field] as any[])];
    newArr[index] = { ...newArr[index], [key]: val };
    handleFieldChange(field, newArr);
  };

  const iconStyle = { width: rem(18), height: rem(18) };

  return (
    <form action={formAction}>
      <Paper shadow="md" p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={isPending} />
        
        <Group justify="space-between" mb="lg">
          <Title order={2}>Criar Novo Evento</Title>
          {state?.message && (
            <Alert color={state.success ? 'green' : 'red'} icon={<IconAlertCircle />}>
              {state.message}
            </Alert>
          )}
        </Group>

        <Tabs defaultValue="visual" keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="visual" leftSection={<IconForms style={iconStyle} />}>Editor Visual</Tabs.Tab>
            <Tabs.Tab value="json" leftSection={<IconCode style={iconStyle} />}>Editor JSON</Tabs.Tab>
          </Tabs.List>

          {/* ================= VISUAL EDITOR ================= */}
          <Tabs.Panel value="visual">
            <Tabs orientation="horizontal" variant="outline" defaultValue="general" radius="md">
              <Tabs.List mb="md">
                <Tabs.Tab value="general" leftSection={<IconInfoCircle style={iconStyle} />}>Geral</Tabs.Tab>
                <Tabs.Tab value="timeline" leftSection={<IconClock style={iconStyle} />}>Timeline</Tabs.Tab>
                <Tabs.Tab value="speakers" leftSection={<IconUser style={iconStyle} />}>Palestrantes</Tabs.Tab>
                <Tabs.Tab value="menu" leftSection={<IconToolsKitchen2 style={iconStyle} />}>Menu</Tabs.Tab>
              </Tabs.List>

              {/* 1. GENERAL TAB */}
              <Tabs.Panel value="general">
                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                      <TextInput
                        label="Nome do Evento"
                        placeholder="Ex: Jantar de Verão"
                        value={eventData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        error={state?.errors?.name}
                        required
                      />
                      <Textarea
                        label="Descrição"
                        value={eventData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        minRows={4}
                      />
                      <Group grow>
                        <TextInput
                          label="Dress Code"
                          value={eventData.dressCode}
                          onChange={(e) => handleFieldChange('dressCode', e.target.value)}
                        />
                        <TextInput
                          label="Localização"
                          value={eventData.locationInfo}
                          onChange={(e) => handleFieldChange('locationInfo', e.target.value)}
                        />
                      </Group>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack>
                      <DateSelector 
                        value={eventData.availableDates}
                        onChange={(dates) => handleFieldChange('availableDates', dates)}
                        error={state?.errors?.availableDates}
                      />
                      <ImageUpload 
                        label="Imagem de Capa"
                        value={eventData.imageUrl}
                        onChange={(url) => handleFieldChange('imageUrl', url)}
                      />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>

              {/* 2. TIMELINE TAB */}
              <Tabs.Panel value="timeline">
                <Stack gap="md">
                   <Group justify="flex-end">
                    <Button 
                      leftSection={<IconPlus size={16} />} 
                      onClick={() => addItem('timeline', { time: '19:00', title: '', description: '', order: eventData.timeline.length + 1 })}
                      variant="light"
                    >
                      Adicionar Horário
                    </Button>
                  </Group>
                  {eventData.timeline.map((item, idx) => (
                    <Card key={idx} withBorder padding="sm" radius="sm">
                      <Group align="flex-start">
                        <TextInput 
                          placeholder="00:00" w={80}
                          value={item.time} 
                          onChange={(e) => updateItem('timeline', idx, 'time', e.target.value)} 
                        />
                        <Stack gap="xs" style={{ flexGrow: 1 }}>
                          <TextInput 
                            placeholder="O que vai acontecer?" 
                            value={item.title}
                            onChange={(e) => updateItem('timeline', idx, 'title', e.target.value)}
                          />
                          <Textarea 
                            placeholder="Detalhes adicionais" autosize minRows={1}
                            value={item.description}
                            onChange={(e) => updateItem('timeline', idx, 'description', e.target.value)}
                          />
                        </Stack>
                        <NumberInput 
                          w={70} value={item.order} 
                          onChange={(val) => updateItem('timeline', idx, 'order', val)}
                        />
                        <ActionIcon color="red" variant="subtle" onClick={() => removeItem('timeline', idx)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  ))}
                  {eventData.timeline.length === 0 && <Text c="dimmed" ta="center">Nenhum item na timeline.</Text>}
                </Stack>
              </Tabs.Panel>

              {/* 3. SPEAKERS TAB */}
              <Tabs.Panel value="speakers">
                <Stack gap="md">
                  <Group justify="flex-end">
                    <Button 
                      leftSection={<IconPlus size={16} />} 
                      onClick={() => addItem('speakers', { name: '', role: '', bio: '', imageUrl: '' })}
                      variant="light"
                    >
                      Adicionar Palestrante
                    </Button>
                  </Group>
                  
                  <Grid>
                    {eventData.speakers.map((speaker, idx) => (
                      <Grid.Col key={idx} span={{ base: 12, md: 6 }}>
                        <Card withBorder padding="sm" radius="sm">
                           <Group justify="flex-end" mb="xs">
                              <ActionIcon color="red" variant="subtle" size="xs" onClick={() => removeItem('speakers', idx)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                           </Group>
                           <Group align="flex-start">
                              <Stack gap={4}>
                                <ImageUpload 
                                  label="" 
                                  value={speaker.imageUrl} 
                                  onChange={(url) => updateItem('speakers', idx, 'imageUrl', url)} 
                                />
                              </Stack>
                              <Stack gap="xs" style={{ flexGrow: 1 }}>
                                <TextInput 
                                  placeholder="Nome" 
                                  value={speaker.name}
                                  onChange={(e) => updateItem('speakers', idx, 'name', e.target.value)}
                                />
                                <TextInput 
                                  placeholder="Cargo / Título" 
                                  value={speaker.role}
                                  onChange={(e) => updateItem('speakers', idx, 'role', e.target.value)}
                                />
                                <Textarea 
                                  placeholder="Bio curta" autosize
                                  value={speaker.bio}
                                  onChange={(e) => updateItem('speakers', idx, 'bio', e.target.value)}
                                />
                              </Stack>
                           </Group>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                  {eventData.speakers.length === 0 && <Text c="dimmed" ta="center">Nenhum palestrante adicionado.</Text>}
                </Stack>
              </Tabs.Panel>

              {/* 4. MENU TAB */}
              <Tabs.Panel value="menu">
                <Stack gap="md">
                  <Group justify="flex-end">
                    <Button 
                      leftSection={<IconPlus size={16} />} 
                      onClick={() => addItem('menuItems', { title: '', description: '', imageUrl: '' })}
                      variant="light"
                    >
                      Adicionar Item
                    </Button>
                  </Group>
                  <Grid>
                    {eventData.menuItems.map((item, idx) => (
                       <Grid.Col key={idx} span={{ base: 12, md: 6 }}>
                        <Card withBorder padding="sm" radius="sm">
                          <Group justify="flex-end" mb="xs">
                              <ActionIcon color="red" variant="subtle" size="xs" onClick={() => removeItem('menuItems', idx)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                           </Group>
                          <Group align="flex-start">
                             <div style={{ width: 100 }}>
                                <ImageUpload 
                                  label="" 
                                  value={item.imageUrl} 
                                  onChange={(url) => updateItem('menuItems', idx, 'imageUrl', url)} 
                                />
                             </div>
                             <Stack gap="xs" style={{ flexGrow: 1 }}>
                                <TextInput 
                                  placeholder="Título do Prato" 
                                  value={item.title}
                                  onChange={(e) => updateItem('menuItems', idx, 'title', e.target.value)}
                                />
                                <Textarea 
                                  placeholder="Descrição" autosize
                                  value={item.description}
                                  onChange={(e) => updateItem('menuItems', idx, 'description', e.target.value)}
                                />
                             </Stack>
                          </Group>
                        </Card>
                       </Grid.Col>
                    ))}
                  </Grid>
                  {eventData.menuItems.length === 0 && <Text c="dimmed" ta="center">Nenhum item de menu.</Text>}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>

          {/* ================= JSON EDITOR ================= */}
          <Tabs.Panel value="json">
            <Stack>
              <Alert color="blue" title="Modo Avançado">
                Copie e cole configurações de eventos anteriores aqui.
              </Alert>
              <JsonInput
                label="JSON Completo"
                validationError={jsonError}
                formatOnBlur
                autosize
                minRows={20}
                value={jsonString}
                onChange={handleJsonChange}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Hidden Inputs for Server Action */}
        <input type="hidden" name="availableDates" value={JSON.stringify(eventData.availableDates)} />
        <input type="hidden" name="menuItems" value={JSON.stringify(eventData.menuItems)} />
        <input type="hidden" name="speakers" value={JSON.stringify(eventData.speakers)} />
        <input type="hidden" name="timeline" value={JSON.stringify(eventData.timeline)} />
        <input type="hidden" name="name" value={eventData.name} />
        <input type="hidden" name="description" value={eventData.description} />
        <input type="hidden" name="dressCode" value={eventData.dressCode} />
        <input type="hidden" name="locationInfo" value={eventData.locationInfo} />
        <input type="hidden" name="imageUrl" value={eventData.imageUrl} />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" size="lg" color="red">
            Salvar Evento
          </Button>
        </Group>
      </Paper>
    </form>
  );
}