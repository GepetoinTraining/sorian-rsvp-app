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
  Grid,
  Alert,
  LoadingOverlay,
  Divider,
  ActionIcon,
  Text,
  Card
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { ImageUpload } from '@/app/components/ImageUpload';
import { IconCode, IconForms, IconCalendar, IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

interface MenuItem {
  title: string;
  description: string;
  imageUrl: string;
}

interface ActionState {
  success: boolean;
  message: string | null;
  errors?: {
    name?: string[];
    [key: string]: string[] | undefined;
  };
}

const INITIAL_EVENT = {
  name: "",
  description: "",
  dressCode: "",
  locationInfo: "",
  imageUrl: "",
  availableDates: [] as string[],
  menuItems: [] as MenuItem[], // New Menu Items Array
};

export function EventCreator() {
  const [eventData, setEventData] = useState(INITIAL_EVENT);
  const [jsonString, setJsonString] = useState(JSON.stringify(INITIAL_EVENT, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEvent as any, 
    { success: false, message: null }
  );

  // Sync Logic
  const updateState = (newData: typeof INITIAL_EVENT) => {
    setEventData(newData);
    setJsonString(JSON.stringify(newData, null, 2));
  };

  const handleFormChange = (field: string, value: any) => {
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

  const handleDateChange = (dates: Date[]) => {
    const dateStrings = dates.map(d => dayjs(d).format('YYYY-MM-DD'));
    handleFormChange('availableDates', dateStrings);
  };

  // --- Menu Logic ---
  const addMenuItem = () => {
    const newItems = [...eventData.menuItems, { title: "", description: "", imageUrl: "" }];
    handleFormChange('menuItems', newItems);
  };

  const removeMenuItem = (index: number) => {
    const newItems = eventData.menuItems.filter((_, i) => i !== index);
    handleFormChange('menuItems', newItems);
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = [...eventData.menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleFormChange('menuItems', newItems);
  };

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

        <Tabs defaultValue="form" keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="form" leftSection={<IconForms size={16} />}>Editor Visual</Tabs.Tab>
            <Tabs.Tab value="json" leftSection={<IconCode size={16} />}>Editor JSON</Tabs.Tab>
          </Tabs.List>

          {/* --- VISUAL EDITOR --- */}
          <Tabs.Panel value="form">
            <Grid gutter="xl">
              {/* LEFT COLUMN: Details */}
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="md">
                  <TextInput
                    label="Nome do Evento"
                    placeholder="Ex: Jantar de Verão"
                    name="name"
                    value={eventData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    required
                    error={state?.errors?.name}
                  />
                  
                  <Textarea
                    label="Descrição"
                    name="description"
                    value={eventData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    minRows={3}
                  />

                  <Group grow>
                    <TextInput
                      label="Dress Code"
                      name="dressCode"
                      value={eventData.dressCode}
                      onChange={(e) => handleFormChange('dressCode', e.target.value)}
                    />
                    <TextInput
                      label="Localização"
                      name="locationInfo"
                      value={eventData.locationInfo}
                      onChange={(e) => handleFormChange('locationInfo', e.target.value)}
                    />
                  </Group>
                   
                  {/* Image Upload for Main Event */}
                  <ImageUpload 
                    label="Capa do Evento"
                    value={eventData.imageUrl}
                    onChange={(url) => handleFormChange('imageUrl', url)}
                  />
                  {/* Hidden input ensures the URL is sent in FormData if JS fails (though we rely on json payload mostly) */}
                  <input type="hidden" name="imageUrl" value={eventData.imageUrl} />
                </Stack>
              </Grid.Col>

              {/* RIGHT COLUMN: Dates & Menu */}
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="xl">
                  <Paper withBorder p="md" bg="gray.0">
                    <DatePickerInput
                      type="multiple"
                      label="Datas Disponíveis"
                      placeholder="Selecione as datas"
                      leftSection={<IconCalendar size={16} />}
                      value={eventData.availableDates.map(d => new Date(d))} 
                      onChange={(val) => handleDateChange(val as unknown as Date[])}
                      mb="xs"
                      locale="pt-br"
                    />
                  </Paper>

                  {/* Menu Builder Section */}
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Title order={4}>Menu / Coleção</Title>
                      <Button 
                        variant="light" 
                        size="xs" 
                        leftSection={<IconPlus size={14}/>} 
                        onClick={addMenuItem}
                      >
                        Adicionar Item
                      </Button>
                    </Group>
                    
                    <Stack gap="md">
                      {eventData.menuItems.length === 0 && (
                        <Text c="dimmed" size="sm" fs="italic">Nenhum item no menu.</Text>
                      )}

                      {eventData.menuItems.map((item, index) => (
                        <Card key={index} withBorder shadow="sm" p="sm" radius="md">
                          <Group justify="flex-end" mb={-10}>
                             <ActionIcon color="red" variant="subtle" size="sm" onClick={() => removeMenuItem(index)}>
                                <IconTrash size={14} />
                             </ActionIcon>
                          </Group>
                          <Stack gap="xs">
                            <TextInput 
                              placeholder="Título (ex: Linha 1)" 
                              value={item.title}
                              onChange={(e) => updateMenuItem(index, 'title', e.target.value)}
                            />
                            <Textarea 
                              placeholder="Descrição" 
                              autosize minRows={2}
                              value={item.description}
                              onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                            />
                            <ImageUpload 
                              label="Imagem do Item"
                              value={item.imageUrl}
                              onChange={(url) => updateMenuItem(index, 'imageUrl', url)}
                            />
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </div>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* --- JSON EDITOR --- */}
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

        {/* Hidden Inputs to pass complex data to Server Action via FormData */}
        <input type="hidden" name="availableDates" value={JSON.stringify(eventData.availableDates)} />
        <input type="hidden" name="menuItems" value={JSON.stringify(eventData.menuItems)} />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" size="lg" color="red">
            Salvar Evento
          </Button>
        </Group>
      </Paper>
    </form>
  );
}