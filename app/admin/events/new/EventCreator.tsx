// app/admin/events/new/EventCreator.tsx
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createEvent, updateEvent } from '@/app/admin/actions'; 
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
  Switch,
  Divider,
  rem,
  NavLink,
  Box,
  ScrollArea
} from '@mantine/core';
import { ImageUpload } from '@/app/components/ImageUpload';
import { DateSelector } from '@/app/components/DateSelector';
import { InvitationGenerator } from '@/app/components/InvitationGenerator';
import { 
  IconCode, IconForms, IconAlertCircle, IconPlus, IconTrash, 
  IconClock, IconUser, IconToolsKitchen2, IconInfoCircle, IconSettings, IconUsersGroup, IconChevronRight
} from '@tabler/icons-react';

// --- TYPES ---
interface MenuItem { title: string; description: string; imageUrl: string; section?: string; } // Updated interface
interface Speaker { name: string; role: string; bio: string; imageUrl: string; }
interface TimelineItem { time: string; title: string; description: string; order: number; }
interface Participant { name: string; }

interface ActionState {
  success: boolean;
  message: string | null;
  errors?: { [key: string]: string[] | undefined; };
}

const INITIAL_EVENT_STATE = {
  name: "",
  description: "",
  dressCode: "",
  locationInfo: "",
  imageUrl: "",
  hasPlusOne: false,
  availableDates: [] as string[],
  menuItems: [] as MenuItem[],
  speakers: [] as Speaker[],
  timeline: [] as TimelineItem[],
  participants: [] as Participant[],
};

interface EventCreatorProps {
  initialData?: typeof INITIAL_EVENT_STATE;
  eventId?: string;
}

export function EventCreator({ initialData, eventId }: EventCreatorProps) {
  const [eventData, setEventData] = useState(initialData || INITIAL_EVENT_STATE);
  const [jsonString, setJsonString] = useState(JSON.stringify(eventData, null, 2));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeMenuItemIndex, setActiveMenuItemIndex] = useState<number | null>(null);
  const [bulkNames, setBulkNames] = useState("");

  const actionToUse = eventId ? updateEvent.bind(null, eventId) : createEvent;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    actionToUse as any, 
    { success: false, message: null }
  );

  // --- SYNC HELPERS ---
  const updateState = (newData: typeof INITIAL_EVENT_STATE) => {
    setEventData(newData);
    setJsonString(JSON.stringify(newData, null, 2));
  };

  const handleFieldChange = (field: keyof typeof INITIAL_EVENT_STATE, value: any) => {
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

  // --- ITEM HELPERS ---
  const addItem = (field: 'menuItems' | 'speakers' | 'timeline' | 'participants', item: any) => {
    const newArr = [...eventData[field], item];
    handleFieldChange(field, newArr);
    if (field === 'menuItems') setActiveMenuItemIndex(newArr.length - 1);
  };

  const removeItem = (field: 'menuItems' | 'speakers' | 'timeline' | 'participants', index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArr = (eventData[field] as any[]).filter((_, i) => i !== index);
    handleFieldChange(field, newArr);
    if (field === 'menuItems' && index === activeMenuItemIndex) setActiveMenuItemIndex(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (field: 'menuItems' | 'speakers' | 'timeline' | 'participants', index: number, key: string, val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArr = [...(eventData[field] as any[])];
    newArr[index] = { ...newArr[index], [key]: val };
    handleFieldChange(field, newArr);
  };

  const handleBulkAdd = () => {
    if (!bulkNames) return;
    const names = bulkNames.split('\n').filter(n => n.trim() !== '').map(name => ({ name: name.trim() }));
    handleFieldChange('participants', [...eventData.participants, ...names]);
    setBulkNames("");
  };

  const iconStyle = { width: rem(18), height: rem(18) };

  return (
    <form action={formAction}>
      <Paper shadow="md" p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={isPending} />
        
        <Group justify="space-between" mb="lg">
          <Title order={2}>{eventId ? "Editar Evento" : "Criar Novo Evento"}</Title>
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
                <Tabs.Tab value="participants" leftSection={<IconUsersGroup style={iconStyle} />}>Participantes</Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings style={iconStyle} />}>Configurações</Tabs.Tab>
              </Tabs.List>

              {/* 1. GENERAL */}
              <Tabs.Panel value="general">
                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                      <TextInput label="Nome do Evento" value={eventData.name} onChange={(e) => handleFieldChange('name', e.target.value)} required />
                      <Textarea label="Descrição" value={eventData.description} onChange={(e) => handleFieldChange('description', e.target.value)} minRows={4} />
                      <Group grow>
                        <TextInput label="Dress Code" value={eventData.dressCode} onChange={(e) => handleFieldChange('dressCode', e.target.value)} />
                        <TextInput label="Localização" value={eventData.locationInfo} onChange={(e) => handleFieldChange('locationInfo', e.target.value)} />
                      </Group>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack>
                      <DateSelector value={eventData.availableDates} onChange={(dates) => handleFieldChange('availableDates', dates)} />
                      <ImageUpload label="Imagem de Capa" value={eventData.imageUrl} onChange={(url) => handleFieldChange('imageUrl', url)} />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>

              {/* 2. TIMELINE */}
              <Tabs.Panel value="timeline">
                <Stack gap="md">
                  <Button variant="light" leftSection={<IconPlus size={16}/>} onClick={() => addItem('timeline', { time: '19:00', title: '', description: '', order: eventData.timeline.length + 1 })}>Adicionar Horário</Button>
                  {eventData.timeline.map((item, idx) => (
                    <Card key={idx} withBorder padding="sm"><Group align="flex-start"><TextInput w={80} value={item.time} onChange={(e) => updateItem('timeline', idx, 'time', e.target.value)} /><TextInput style={{flexGrow:1}} value={item.title} onChange={(e) => updateItem('timeline', idx, 'title', e.target.value)} /><ActionIcon color="red" onClick={() => removeItem('timeline', idx)}><IconTrash size={16}/></ActionIcon></Group></Card>
                  ))}
                </Stack>
              </Tabs.Panel>

              {/* 3. SPEAKERS */}
              <Tabs.Panel value="speakers">
                <Stack gap="md">
                   <Button variant="light" leftSection={<IconPlus size={16}/>} onClick={() => addItem('speakers', { name: '', role: '', bio: '', imageUrl: '' })}>Adicionar Palestrante</Button>
                   <Grid>
                    {eventData.speakers.map((speaker, idx) => (
                      <Grid.Col key={idx} span={6}>
                        <Card withBorder padding="sm">
                           <Group justify="flex-end"><ActionIcon color="red" size="xs" onClick={() => removeItem('speakers', idx)}><IconTrash size={14}/></ActionIcon></Group>
                           <Group align="flex-start">
                              <ImageUpload value={speaker.imageUrl} onChange={(url) => updateItem('speakers', idx, 'imageUrl', url)} label="" />
                              <Stack gap="xs" style={{flexGrow:1}}>
                                <TextInput placeholder="Nome" value={speaker.name} onChange={(e) => updateItem('speakers', idx, 'name', e.target.value)} />
                                <TextInput placeholder="Role" value={speaker.role} onChange={(e) => updateItem('speakers', idx, 'role', e.target.value)} />
                              </Stack>
                           </Group>
                        </Card>
                      </Grid.Col>
                    ))}
                   </Grid>
                </Stack>
              </Tabs.Panel>

              {/* 4. MENU - MASTER DETAIL */}
              <Tabs.Panel value="menu">
                <Paper withBorder h={500} style={{ display: 'flex', overflow: 'hidden' }}>
                  <Box w={250} style={{ borderRight: '1px solid var(--mantine-color-gray-3)', display: 'flex', flexDirection: 'column' }}>
                     <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                        <Button fullWidth variant="light" leftSection={<IconPlus size={16} />} onClick={() => addItem('menuItems', { title: 'Novo Prato', description: '', imageUrl: '', section: '' })}>Novo Item</Button>
                     </Box>
                     <ScrollArea style={{ flexGrow: 1 }}>
                        {eventData.menuItems.map((item, idx) => (
                          <NavLink key={idx} label={item.title || "(Sem título)"} active={idx === activeMenuItemIndex} onClick={() => setActiveMenuItemIndex(idx)} rightSection={<IconChevronRight size={14} />} color="red" variant="light" />
                        ))}
                     </ScrollArea>
                  </Box>
                  <Box style={{ flexGrow: 1 }} p="lg" bg="gray.0">
                    {activeMenuItemIndex !== null && eventData.menuItems[activeMenuItemIndex] ? (
                      <Stack gap="md">
                        <Group justify="space-between"><Title order={4}>Editar Item</Title><Button color="red" variant="subtle" size="xs" onClick={() => removeItem('menuItems', activeMenuItemIndex)}>Remover</Button></Group>
                        <Paper withBorder p="md" shadow="sm" radius="md">
                          <Stack gap="md">
                             {/* ADDED SECTION INPUT HERE */}
                            <TextInput 
                              label="Seção (Opcional)" 
                              placeholder="Ex: Entradas, Principal..." 
                              value={eventData.menuItems[activeMenuItemIndex].section || ''} 
                              onChange={(e) => updateItem('menuItems', activeMenuItemIndex, 'section', e.target.value)} 
                            />
                            
                            <TextInput label="Título" value={eventData.menuItems[activeMenuItemIndex].title} onChange={(e) => updateItem('menuItems', activeMenuItemIndex, 'title', e.target.value)} />
                            <Textarea label="Descrição" autosize minRows={4} value={eventData.menuItems[activeMenuItemIndex].description} onChange={(e) => updateItem('menuItems', activeMenuItemIndex, 'description', e.target.value)} />
                            <ImageUpload label="Imagem" value={eventData.menuItems[activeMenuItemIndex].imageUrl} onChange={(url) => updateItem('menuItems', activeMenuItemIndex, 'imageUrl', url)} />
                          </Stack>
                        </Paper>
                      </Stack>
                    ) : <Stack align="center" justify="center" h="100%" c="dimmed"><Text>Selecione um item.</Text></Stack>}
                  </Box>
                </Paper>
              </Tabs.Panel>

              {/* 5. PARTICIPANTS */}
              <Tabs.Panel value="participants">
                <Stack gap="md">
                  <Group align="flex-start" grow>
                    <Stack gap="xs"><Text fw={500}>Adicionar em Massa</Text><Textarea placeholder="Nomes (um por linha)" minRows={5} value={bulkNames} onChange={(e) => setBulkNames(e.target.value)} /><Button variant="light" onClick={handleBulkAdd}>Adicionar</Button></Stack>
                    <Stack gap="xs">
                      <Text fw={500}>Lista ({eventData.participants.length})</Text>
                      <Paper withBorder h={200} style={{ overflowY: 'auto' }} p="xs">
                        <Stack gap="xs">
                          {eventData.participants.map((p, idx) => (
                            <Group key={idx} justify="space-between"><Text size="sm">{p.name}</Text><ActionIcon color="red" size="xs" variant="subtle" onClick={() => removeItem('participants', idx)}><IconTrash size={12}/></ActionIcon></Group>
                          ))}
                        </Stack>
                      </Paper>
                    </Stack>
                  </Group>
                  <Divider />
                  <InvitationGenerator event={{ id: eventId || "preview", name: eventData.name || "Evento" }} participants={eventData.participants} />
                </Stack>
              </Tabs.Panel>

              {/* 6. SETTINGS */}
              <Tabs.Panel value="settings">
                <Paper withBorder p="lg"><Group justify="space-between"><Text fw={500}>Permitir +1</Text><Switch size="lg" onLabel="ON" offLabel="OFF" checked={eventData.hasPlusOne} onChange={(e) => handleFieldChange('hasPlusOne', e.currentTarget.checked)} /></Group></Paper>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>

          <Tabs.Panel value="json">
            <JsonInput label="JSON" value={jsonString} onChange={handleJsonChange} formatOnBlur autosize minRows={20} />
          </Tabs.Panel>
        </Tabs>

        {/* Hidden Inputs */}
        <input type="hidden" name="availableDates" value={JSON.stringify(eventData.availableDates)} />
        <input type="hidden" name="menuItems" value={JSON.stringify(eventData.menuItems)} />
        <input type="hidden" name="speakers" value={JSON.stringify(eventData.speakers)} />
        <input type="hidden" name="timeline" value={JSON.stringify(eventData.timeline)} />
        <input type="hidden" name="participants" value={JSON.stringify(eventData.participants)} />
        <input type="hidden" name="hasPlusOne" value={String(eventData.hasPlusOne)} />
        <input type="hidden" name="name" value={eventData.name} />
        <input type="hidden" name="description" value={eventData.description} />
        <input type="hidden" name="dressCode" value={eventData.dressCode} />
        <input type="hidden" name="locationInfo" value={eventData.locationInfo} />
        <input type="hidden" name="imageUrl" value={eventData.imageUrl} />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" size="lg" color="red">{eventId ? "Salvar Alterações" : "Criar Evento"}</Button>
        </Group>
      </Paper>
    </form>
  );
}