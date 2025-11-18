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
  Switch,
  Badge,
  Divider,
  rem
} from '@mantine/core';
import { ImageUpload } from '@/app/components/ImageUpload';
import { DateSelector } from '@/app/components/DateSelector';
import { InvitationGenerator } from '@/app/components/InvitationGenerator';
import { 
  IconCode, IconForms, IconAlertCircle, IconPlus, IconTrash, 
  IconClock, IconUser, IconToolsKitchen2, IconInfoCircle, IconSettings, IconUsersGroup
} from '@tabler/icons-react';

// --- TYPES ---
interface MenuItem { title: string; description: string; imageUrl: string; }
interface Speaker { name: string; role: string; bio: string; imageUrl: string; }
interface TimelineItem { time: string; title: string; description: string; order: number; }
interface Participant { name: string; }

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
  hasPlusOne: false, // New Toggle State
  availableDates: [] as string[],
  menuItems: [] as MenuItem[],
  speakers: [] as Speaker[],
  timeline: [] as TimelineItem[],
  participants: [] as Participant[], // New List
};

export function EventCreator() {
  const [eventData, setEventData] = useState(INITIAL_EVENT);
  const [jsonString, setJsonString] = useState(JSON.stringify(INITIAL_EVENT, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEvent as any, 
    { success: false, message: null }
  );

  // --- HELPER FUNCTIONS ---
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

  const addItem = (field: 'menuItems' | 'speakers' | 'timeline' | 'participants', item: any) => {
    handleFieldChange(field, [...eventData[field], item]);
  };

  const removeItem = (field: 'menuItems' | 'speakers' | 'timeline' | 'participants', index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArr = (eventData[field] as any[]).filter((_, i) => i !== index);
    handleFieldChange(field, newArr);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (field: 'menuItems' | 'speakers' | 'timeline' | 'participants', index: number, key: string, val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArr = [...(eventData[field] as any[])];
    newArr[index] = { ...newArr[index], [key]: val };
    handleFieldChange(field, newArr);
  };

  // Quick add for participants from text area
  const [bulkNames, setBulkNames] = useState("");
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
                <Tabs.Tab value="participants" leftSection={<IconUsersGroup style={iconStyle} />}>Participantes</Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings style={iconStyle} />}>Configurações</Tabs.Tab>
              </Tabs.List>

              {/* 1. GENERAL TAB (Same as before) */}
              <Tabs.Panel value="general">
                <Grid gutter="xl">
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                      <TextInput label="Nome do Evento" placeholder="Ex: Jantar de Verão" value={eventData.name} onChange={(e) => handleFieldChange('name', e.target.value)} error={state?.errors?.name} required />
                      <Textarea label="Descrição" value={eventData.description} onChange={(e) => handleFieldChange('description', e.target.value)} minRows={4} />
                      <Group grow>
                        <TextInput label="Dress Code" value={eventData.dressCode} onChange={(e) => handleFieldChange('dressCode', e.target.value)} />
                        <TextInput label="Localização" value={eventData.locationInfo} onChange={(e) => handleFieldChange('locationInfo', e.target.value)} />
                      </Group>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack>
                      <DateSelector value={eventData.availableDates} onChange={(dates) => handleFieldChange('availableDates', dates)} error={state?.errors?.availableDates} />
                      <ImageUpload label="Imagem de Capa" value={eventData.imageUrl} onChange={(url) => handleFieldChange('imageUrl', url)} />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>

              {/* 2. TIMELINE TAB (Same as before) */}
              <Tabs.Panel value="timeline">
                {/* ... existing timeline code ... */}
                <Button leftSection={<IconPlus size={16} />} onClick={() => addItem('timeline', { time: '19:00', title: '', description: '', order: eventData.timeline.length + 1 })} variant="light">Adicionar Horário</Button>
                {eventData.timeline.map((item, idx) => (
                   <Group key={idx} mt="xs"><TextInput value={item.time} onChange={(e) => updateItem('timeline', idx, 'time', e.target.value)} w={80} /><TextInput value={item.title} onChange={(e) => updateItem('timeline', idx, 'title', e.target.value)} style={{flexGrow:1}} /><ActionIcon color="red" onClick={() => removeItem('timeline', idx)}><IconTrash size={16}/></ActionIcon></Group>
                ))}
              </Tabs.Panel>

              {/* 3. SPEAKERS TAB (Same as before) */}
              <Tabs.Panel value="speakers">
                 <Button leftSection={<IconPlus size={16} />} onClick={() => addItem('speakers', { name: '', role: '', bio: '', imageUrl: '' })} variant="light">Adicionar Palestrante</Button>
                 {/* ... existing speaker map code ... */}
                 {eventData.speakers.length === 0 && <Text c="dimmed" mt="md">Sem palestrantes.</Text>}
              </Tabs.Panel>

              {/* 4. MENU TAB (Same as before) */}
              <Tabs.Panel value="menu">
                <Button leftSection={<IconPlus size={16} />} onClick={() => addItem('menuItems', { title: '', description: '', imageUrl: '' })} variant="light">Adicionar Item</Button>
                {/* ... existing menu map code ... */}
                 {eventData.menuItems.length === 0 && <Text c="dimmed" mt="md">Sem menu.</Text>}
              </Tabs.Panel>

              {/* 5. PARTICIPANTS TAB (NEW) */}
              <Tabs.Panel value="participants">
                <Stack gap="xl">
                  <Group align="flex-start" grow>
                    <Stack gap="xs">
                      <Text fw={500}>Adicionar em Massa</Text>
                      <Textarea 
                        placeholder="Cole uma lista de nomes (um por linha)" 
                        minRows={5}
                        value={bulkNames}
                        onChange={(e) => setBulkNames(e.target.value)}
                      />
                      <Button variant="light" onClick={handleBulkAdd}>Processar Lista</Button>
                    </Stack>
                    
                    <Stack gap="xs">
                      <Text fw={500}>Lista de Convidados ({eventData.participants.length})</Text>
                      <Paper withBorder h={200} style={{ overflowY: 'auto' }} p="xs">
                        <Stack gap="xs">
                          {eventData.participants.map((p, idx) => (
                            <Group key={idx} justify="space-between">
                              <Text size="sm">{p.name}</Text>
                              <ActionIcon color="red" size="xs" variant="subtle" onClick={() => removeItem('participants', idx)}>
                                <IconTrash size={12}/>
                              </ActionIcon>
                            </Group>
                          ))}
                          {eventData.participants.length === 0 && <Text c="dimmed" size="sm">Lista vazia.</Text>}
                        </Stack>
                      </Paper>
                    </Stack>
                  </Group>

                  <Divider />

                  {/* INVITATION DOWNLOADER */}
                  {/* Note: We pass a dummy ID if creating new, so this works best on Edit, but useful here to preview */}
                  <InvitationGenerator 
                    event={{ id: "preview", name: eventData.name || "Evento" }} 
                    participants={eventData.participants} 
                  />
                </Stack>
              </Tabs.Panel>

              {/* 6. SETTINGS TAB (NEW) */}
              <Tabs.Panel value="settings">
                <Paper withBorder p="lg" radius="md">
                  <Title order={4} mb="md">Configurações de RSVP</Title>
                  <Stack>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>Permitir Acompanhante (+1)</Text>
                        <Text size="sm" c="dimmed">Os convidados poderão indicar se levarão alguém.</Text>
                      </div>
                      <Switch 
                        size="lg"
                        onLabel="ON" offLabel="OFF"
                        checked={eventData.hasPlusOne}
                        onChange={(e) => handleFieldChange('hasPlusOne', e.currentTarget.checked)}
                      />
                    </Group>
                  </Stack>
                </Paper>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>

          <Tabs.Panel value="json">
            <JsonInput label="JSON Completo" validationError={jsonError} formatOnBlur autosize minRows={20} value={jsonString} onChange={handleJsonChange} />
          </Tabs.Panel>
        </Tabs>

        {/* Hidden Inputs including new fields */}
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
          <Button type="submit" size="lg" color="red">Salvar Evento</Button>
        </Group>
      </Paper>
    </form>
  );
}