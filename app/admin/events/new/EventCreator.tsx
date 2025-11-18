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
  LoadingOverlay
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCode, IconForms, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

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
  availableDates: [] as string[], // Initialize as empty string array
};

export function EventCreator() {
  // Local state for the UI
  const [eventData, setEventData] = useState(INITIAL_EVENT);
  const [jsonString, setJsonString] = useState(JSON.stringify(INITIAL_EVENT, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Server Action Hook
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEvent as any, 
    { success: false, message: null }
  );

  // Update visual form
  const handleFormChange = (field: string, value: any) => {
    const newData = { ...eventData, [field]: value };
    setEventData(newData);
    setJsonString(JSON.stringify(newData, null, 2));
  };

  // Update from JSON editor
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

  // Date Handler
  const handleDateChange = (dates: Date[]) => {
    const dateStrings = dates.map(d => dayjs(d).format('YYYY-MM-DD'));
    handleFormChange('availableDates', dateStrings);
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
            <Tabs.Tab value="form" leftSection={<IconForms size={16} />}>
              Editor Visual
            </Tabs.Tab>
            <Tabs.Tab value="json" leftSection={<IconCode size={16} />}>
              Editor JSON
            </Tabs.Tab>
          </Tabs.List>

          {/* --- FORM BUILDER TAB --- */}
          <Tabs.Panel value="form">
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
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
                    placeholder="Detalhes do evento..."
                    name="description"
                    value={eventData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    minRows={3}
                  />

                  <TextInput
                    label="Dress Code"
                    name="dressCode"
                    value={eventData.dressCode}
                    onChange={(e) => handleFormChange('dressCode', e.target.value)}
                  />

                  <TextInput
                    label="Localização (Info)"
                    name="locationInfo"
                    value={eventData.locationInfo}
                    onChange={(e) => handleFormChange('locationInfo', e.target.value)}
                  />
                   
                  <TextInput
                    label="URL da Imagem de Capa"
                    name="imageUrl"
                    value={eventData.imageUrl}
                    onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                  />
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p="md" bg="gray.0">
                  <DatePickerInput
                    type="multiple"
                    label="Datas Disponíveis"
                    placeholder="Selecione as datas"
                    leftSection={<IconCalendar size={16} />}
                    // Convert string[] state back to Date[] for the component
                    value={eventData.availableDates.map(d => new Date(d))} 
                    // FIX: Use double cast (as unknown as Date[]) to resolve the strict overlap error
                    onChange={(val) => handleDateChange(val as unknown as Date[])}
                    mb="md"
                    locale="pt-br"
                  />
                  {/* Hidden input to send the dates as a JSON string to the server */}
                  <input 
                    type="hidden" 
                    name="availableDates" 
                    value={JSON.stringify(eventData.availableDates)} 
                  />
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* --- JSON TAB --- */}
          <Tabs.Panel value="json">
            <Stack>
              <Alert color="blue" title="Modo Avançado">
                Edite a estrutura do evento diretamente. Útil para copiar/colar configurações de eventos passados.
              </Alert>
              <JsonInput
                label="JSON do Evento"
                validationError={jsonError}
                formatOnBlur
                autosize
                minRows={15}
                value={jsonString}
                onChange={handleJsonChange}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button type="submit" size="lg" color="red">
            Criar Evento
          </Button>
        </Group>
      </Paper>
    </form>
  );
}