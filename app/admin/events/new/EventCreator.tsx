// app/admin/events/new/EventCreator.tsx
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createEvent, updateEvent } from '@/app/admin/actions'; 
import {
  TextInput, Textarea, Button, Group, Paper, Title, Stack, Tabs, JsonInput, Alert, LoadingOverlay, ActionIcon, Text, Card, Grid, Switch, Divider, rem, NavLink, Box, ScrollArea, Select, NumberInput
} from '@mantine/core';
import { ImageUpload } from '@/app/components/ImageUpload';
import { DateSelector } from '@/app/components/DateSelector';
// Import new map component
import { LocationPicker } from '@/app/components/LocationPicker';
import { InvitationGenerator } from '@/app/components/InvitationGenerator';
import { 
  IconCode, IconForms, IconAlertCircle, IconPlus, IconTrash, 
  IconClock, IconUser, IconToolsKitchen2, IconInfoCircle, IconSettings, IconUsersGroup, IconChevronRight, IconLayoutList
} from '@tabler/icons-react';

// --- UPDATED TYPES ---
// We use 'tempId' for client-side management before saving to DB
interface MenuSectionState { tempId: string; title: string; imageUrl: string; order: number; }
// Items now link to the section's tempId
interface MenuItemState { title: string; description: string; imageUrl: string; sectionTempId?: string | null; }

interface Speaker { name: string; role: string; bio: string; imageUrl: string; }
interface TimelineItem { time: string; title: string; description: string; order: number; }
interface Participant { name: string; }

interface ActionState {
  success: boolean;
  message: string | null;
  errors?: { [key: string]: string[] | undefined; };
}

// Helper to generate temporary client-side IDs
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const INITIAL_EVENT_STATE = {
  name: "",
  description: "",
  dressCode: "",
  // Updated Location State
  location: { address: "", lat: null as number | null, lng: null as number | null },
  imageUrl: "",
  hasPlusOne: false,
  availableDates: [] as string[],
  // New Sections Array
  menuSections: [] as MenuSectionState[],
  menuItems: [] as MenuItemState[],
  speakers: [] as Speaker[],
  timeline: [] as TimelineItem[],
  participants: [] as Participant[],
};

interface EventCreatorProps {
    // We need to map incoming DB data to our internal state structure if editing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any; 
  eventId?: string;
}

export function EventCreator({ initialData, eventId }: EventCreatorProps) {
    // --- DATA TRANSFORMATION FOR EDIT MODE ---
    // If editing, we need to convert DB IDs to tempIDs for the form state to work consistently
    let startingState = INITIAL_EVENT_STATE;
    if (initialData && eventId) {
        startingState = {
            ...initialData,
            location: {
                address: initialData.locationAddress || "",
                lat: initialData.locationLat || null,
                lng: initialData.locationLng || null
            },
            // Map DB sections to state sections with tempId = dbId
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            menuSections: initialData.menuSections.map((s: any) => ({
                tempId: s.id, 
                title: s.title,
                imageUrl: s.imageUrl || "",
                order: s.order
            })),
            // Map DB items, ensuring sectionTempId matches the section's ID
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            menuItems: initialData.menuItems.map((i: any) => ({
                title: i.title,
                description: i.description || "",
                imageUrl: i.imageUrl || "",
                sectionTempId: i.sectionId || null 
            }))
        };
    }


  const [eventData, setEventData] = useState(startingState);
  const [jsonString, setJsonString] = useState(JSON.stringify(eventData, null, 2));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Separate active indexes for sections and plates tabs
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [activeMenuItemIndex, setActiveMenuItemIndex] = useState<number | null>(null);
  const [bulkNames, setBulkNames] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actionToUse = eventId ? updateEvent.bind(null, eventId) : createEvent;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actionToUse as any, 
    { success: false, message: null }
  );

  // --- SYNC HELPERS ---
  const updateState = (newData: typeof startingState) => {
    setEventData(newData);
    setJsonString(JSON.stringify(newData, null, 2));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (field: keyof typeof startingState, value: any) => {
    updateState({ ...eventData, [field]: value });
  };
  
  const handleLocationChange = (newLocation: typeof eventData.location) => {
      handleFieldChange('location', newLocation);
  }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addItem = (field: 'menuSections' | 'menuItems' | 'speakers' | 'timeline' | 'participants', item: any) => {
  // We need to tell TS that if field is menuSections, the item type is correct for adding tempId
  if (field === 'menuSections') {
    // Cast item to any to bypass the union type check for this specific operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item as any).tempId = generateTempId();
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newArr = [...eventData[field] as any[], item];
  handleFieldChange(field, newArr);
  
  if (field === 'menuSections') setActiveSectionIndex(newArr.length - 1);
  if (field === 'menuItems') setActiveMenuItemIndex(newArr.length - 1);
};
  
  const removeItem = (field: 'menuSections' |'menuItems' | 'speakers' | 'timeline' | 'participants', index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemToRemove = eventData[field][index];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArr = (eventData[field] as any[]).filter((_, i) => i !== index);
    handleFieldChange(field, newArr);

    // If removing a section, unset the active index
    if (field === 'menuSections') {
         // Cast itemToRemove to MenuSectionState to access tempId safely
         const sectionToRemove = itemToRemove as MenuSectionState;
         
         if(index === activeSectionIndex) setActiveSectionIndex(null);
         // Optional: Cascading delete - remove items belonging to this section?
         // For now, let's just orphan them (set sectionTempId to null)
         const updatedItems = eventData.menuItems.map(mi => 
            mi.sectionTempId === sectionToRemove.tempId ? { ...mi, sectionTempId: null } : mi
         );
         handleFieldChange('menuItems', updatedItems);
    }

    if (field === 'menuItems' && index === activeMenuItemIndex) setActiveMenuItemIndex(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (field: 'menuSections' | 'menuItems' | 'speakers' | 'timeline' | 'participants', index: number, key: string, val: any) => {
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

  // Prepare options for the section select dropdown
  const sectionOptions = eventData.menuSections.map(s => ({ value: s.tempId, label: s.title }));
  sectionOptions.unshift({ value: '', label: 'Sem Seção (Geral)' });


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
              <Tabs.List mb="md" style={{flexWrap: 'wrap'}}>
                <Tabs.Tab value="general" leftSection={<IconInfoCircle style={iconStyle} />}>Geral</Tabs.Tab>
                <Tabs.Tab value="timeline" leftSection={<IconClock style={iconStyle} />}>Timeline</Tabs.Tab>
                <Tabs.Tab value="speakers" leftSection={<IconUser style={iconStyle} />}>Palestrantes</Tabs.Tab>
                {/* NEW TABS STRUCTURE */}
                <Tabs.Tab value="menuSections" leftSection={<IconLayoutList style={iconStyle} />}>Seções do Menu</Tabs.Tab>
                <Tabs.Tab value="menuItems" leftSection={<IconToolsKitchen2 style={iconStyle} />}>Pratos</Tabs.Tab>
                <Tabs.Tab value="participants" leftSection={<IconUsersGroup style={iconStyle} />}>Participantes</Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings style={iconStyle} />}>Configurações</Tabs.Tab>
              </Tabs.List>

              {/* 1. GENERAL - UPDATED WITH MAP */}
              <Tabs.Panel value="general">
                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                      <TextInput label="Nome do Evento" value={eventData.name} onChange={(e) => handleFieldChange('name', e.target.value)} required />
                      <Textarea label="Descrição" value={eventData.description} onChange={(e) => handleFieldChange('description', e.target.value)} minRows={4} />
                      {/* New Location Picker Component */}
                      <LocationPicker value={eventData.location} onChange={handleLocationChange} />
                      <TextInput label="Dress Code" value={eventData.dressCode} onChange={(e) => handleFieldChange('dressCode', e.target.value)} />
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

              {/* 2. TIMELINE (Unchanged) */}
              <Tabs.Panel value="timeline">
                 <Stack gap="md">
                  <Button variant="light" leftSection={<IconPlus size={16}/>} onClick={() => addItem('timeline', { time: '19:00', title: '', description: '', order: eventData.timeline.length + 1 })}>Adicionar Horário</Button>
                  {eventData.timeline.map((item, idx) => (
                    <Card key={idx} withBorder padding="sm"><Group align="flex-start"><TextInput w={80} value={item.time} onChange={(e) => updateItem('timeline', idx, 'time', e.target.value)} /><TextInput style={{flexGrow:1}} value={item.title} onChange={(e) => updateItem('timeline', idx, 'title', e.target.value)} /><ActionIcon color="red" onClick={() => removeItem('timeline', idx)}><IconTrash size={16}/></ActionIcon></Group></Card>
                  ))}
                </Stack>
              </Tabs.Panel>

              {/* 3. SPEAKERS (Unchanged) */}
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

              {/* 4. NEW TAB: MENU SECTIONS */}
              <Tabs.Panel value="menuSections">
                 <Paper withBorder h={500} style={{ display: 'flex', overflow: 'hidden' }}>
                  {/* Master List */}
                  <Box w={250} style={{ borderRight: '1px solid var(--mantine-color-gray-3)', display: 'flex', flexDirection: 'column' }}>
                     <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                        <Button fullWidth variant="light" leftSection={<IconPlus size={16} />} onClick={() => addItem('menuSections', { title: 'Nova Seção', imageUrl: '', order: eventData.menuSections.length })}>Nova Seção</Button>
                     </Box>
                     <ScrollArea style={{ flexGrow: 1 }}>
                        {eventData.menuSections.map((item, idx) => (
                          <NavLink key={item.tempId} label={item.title || "(Sem título)"} active={idx === activeSectionIndex} onClick={() => setActiveSectionIndex(idx)} rightSection={<IconChevronRight size={14} />} color="blue" variant="light" description={`Ordem: ${item.order}`}/>
                        ))}
                     </ScrollArea>
                  </Box>
                  {/* Detail View */}
                  {/* FIX: Merged duplicate style prop here */}
                  <Box p="lg" bg="gray.0" style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {activeSectionIndex !== null && eventData.menuSections[activeSectionIndex] ? (
                      <Stack gap="md">
                        <Group justify="space-between"><Title order={4}>Editar Seção</Title><Button color="red" variant="subtle" size="xs" onClick={() => removeItem('menuSections', activeSectionIndex)}>Remover</Button></Group>
                        <Paper withBorder p="md" shadow="sm" radius="md">
                          <Stack gap="md">
                            <TextInput label="Título da Seção" value={eventData.menuSections[activeSectionIndex].title} onChange={(e) => updateItem('menuSections', activeSectionIndex, 'title', e.target.value)} required/>
                             <NumberInput label="Ordem de Exibição" value={eventData.menuSections[activeSectionIndex].order} onChange={(val) => updateItem('menuSections', activeSectionIndex, 'order', val)} />
                            <ImageUpload label="Imagem de Cabeçalho da Seção" value={eventData.menuSections[activeSectionIndex].imageUrl} onChange={(url) => updateItem('menuSections', activeSectionIndex, 'imageUrl', url)} />
                          </Stack>
                        </Paper>
                      </Stack>
                    ) : <Stack align="center" justify="center" h="100%" c="dimmed"><Text>Selecione uma seção para editar.</Text></Stack>}
                  </Box>
                </Paper>
              </Tabs.Panel>

              {/* 5. UPDATED TAB: MENU ITEMS (PLATES) */}
              <Tabs.Panel value="menuItems">
                <Paper withBorder h={500} style={{ display: 'flex', overflow: 'hidden' }}>
                  {/* Master List */}
                  <Box w={250} style={{ borderRight: '1px solid var(--mantine-color-gray-3)', display: 'flex', flexDirection: 'column' }}>
                     <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                        <Button fullWidth variant="light" leftSection={<IconPlus size={16} />} onClick={() => addItem('menuItems', { title: 'Novo Prato', description: '', imageUrl: '', sectionTempId: null })}>Novo Prato</Button>
                     </Box>
                     <ScrollArea style={{ flexGrow: 1 }}>
                        {eventData.menuItems.map((item, idx) => {
                            // Find section title for the label description
                           const section = eventData.menuSections.find(s => s.tempId === item.sectionTempId);
                           return (
                          <NavLink key={idx} label={item.title || "(Sem título)"} description={section?.title || "Geral"} active={idx === activeMenuItemIndex} onClick={() => setActiveMenuItemIndex(idx)} rightSection={<IconChevronRight size={14} />} color="red" variant="light" />
                        )})}
                     </ScrollArea>
                  </Box>
                  {/* Detail View */}
                  {/* FIX: Merged duplicate style prop here as well */}
                  <Box p="lg" bg="gray.0" style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {activeMenuItemIndex !== null && eventData.menuItems[activeMenuItemIndex] ? (
                      <Stack gap="md">
                        <Group justify="space-between"><Title order={4}>Editar Prato</Title><Button color="red" variant="subtle" size="xs" onClick={() => removeItem('menuItems', activeMenuItemIndex)}>Remover</Button></Group>
                        <Paper withBorder p="md" shadow="sm" radius="md">
                          <Stack gap="md">
                             {/* UPDATED: Select input for Section linking */}
                            <Select
                                label="Seção do Menu"
                                placeholder="Selecione uma seção"
                                data={sectionOptions}
                                value={eventData.menuItems[activeMenuItemIndex].sectionTempId || ''}
                                onChange={(val) => updateItem('menuItems', activeMenuItemIndex, 'sectionTempId', val === '' ? null : val)}
                            />
                            
                            <TextInput label="Título do Prato" value={eventData.menuItems[activeMenuItemIndex].title} onChange={(e) => updateItem('menuItems', activeMenuItemIndex, 'title', e.target.value)} required />
                            <Textarea label="Descrição" autosize minRows={4} value={eventData.menuItems[activeMenuItemIndex].description} onChange={(e) => updateItem('menuItems', activeMenuItemIndex, 'description', e.target.value)} />
                            <ImageUpload label="Imagem do Prato" value={eventData.menuItems[activeMenuItemIndex].imageUrl} onChange={(url) => updateItem('menuItems', activeMenuItemIndex, 'imageUrl', url)} />
                          </Stack>
                        </Paper>
                      </Stack>
                    ) : <Stack align="center" justify="center" h="100%" c="dimmed"><Text>Selecione um prato para editar.</Text></Stack>}
                  </Box>
                </Paper>
              </Tabs.Panel>

              {/* 6. PARTICIPANTS (Unchanged) */}
              <Tabs.Panel value="participants">
                 {/* ... (Same as before) */}
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

              {/* 7. SETTINGS (Unchanged) */}
              <Tabs.Panel value="settings">
                <Paper withBorder p="lg"><Group justify="space-between"><Text fw={500}>Permitir +1</Text><Switch size="lg" onLabel="ON" offLabel="OFF" checked={eventData.hasPlusOne} onChange={(e) => handleFieldChange('hasPlusOne', e.currentTarget.checked)} /></Group></Paper>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>

          <Tabs.Panel value="json">
            <JsonInput label="JSON" value={jsonString} onChange={handleJsonChange} formatOnBlur autosize minRows={20} />
            {jsonError && <Text c="red" size="sm mt-xs">{jsonError}</Text>}
          </Tabs.Panel>
        </Tabs>

        {/* UPDATED Hidden Inputs for Form Submission */}
        <input type="hidden" name="locationAddress" value={eventData.location.address} />
        {/* Need to cast nulls to empty strings for form data */}
        <input type="hidden" name="locationLat" value={eventData.location.lat !== null ? eventData.location.lat : ''} />
        <input type="hidden" name="locationLng" value={eventData.location.lng !== null ? eventData.location.lng : ''} />

        <input type="hidden" name="availableDates" value={JSON.stringify(eventData.availableDates)} />
        {/* New sections input */}
        <input type="hidden" name="menuSections" value={JSON.stringify(eventData.menuSections)} />
        <input type="hidden" name="menuItems" value={JSON.stringify(eventData.menuItems)} />
        <input type="hidden" name="speakers" value={JSON.stringify(eventData.speakers)} />
        <input type="hidden" name="timeline" value={JSON.stringify(eventData.timeline)} />
        <input type="hidden" name="participants" value={JSON.stringify(eventData.participants)} />
        <input type="hidden" name="hasPlusOne" value={String(eventData.hasPlusOne)} />
        <input type="hidden" name="name" value={eventData.name} />
        <input type="hidden" name="description" value={eventData.description} />
        <input type="hidden" name="dressCode" value={eventData.dressCode} />
        <input type="hidden" name="imageUrl" value={eventData.imageUrl} />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" size="lg" color="red" loading={isPending}>{eventId ? "Salvar Alterações" : "Criar Evento"}</Button>
        </Group>
      </Paper>
    </form>
  );
}