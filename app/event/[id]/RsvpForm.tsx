'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitRsvp } from '@/app/actions'; // Ensure this action exists in app/actions.ts
import { 
  Title, 
  Text, 
  Paper, 
  TextInput, 
  Checkbox, 
  Button, 
  Stack, 
  Notification, 
  Collapse, 
  Box 
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

// Define the shape of the server action state
interface RsvpState {
  message: string | null;
  status: 'success' | 'error' | null;
}

// Button component to handle pending state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      fullWidth 
      size="lg" 
      mt="xl" 
      color="red"
      loading={pending}
      loaderProps={{ type: 'dots' }}
    >
      Confirmar Presença (RSVP)
    </Button>
  );
}

interface RsvpFormProps {
  eventId: string;
  availableDates: string[];
  hasPlusOne: boolean;
  initialName?: string;
}

export default function RsvpForm({ 
  eventId, 
  availableDates, 
  hasPlusOne, 
  initialName = "" 
}: RsvpFormProps) {
  
  const initialState: RsvpState = { message: null, status: null };
  
  // Use the server action
  const [state, formAction] = useFormState<RsvpState, FormData>(submitRsvp as any, initialState);

  // Local state for UI interactions
  const [bringingGuest, setBringingGuest] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Controlled input for name to allow pre-filling via props
  const [name, setName] = useState(initialName);

  // Format date string (YYYY-MM-DD) to readable format
  const formatDate = (dateString: string) => {
    // Append time to prevent timezone shifts
    const date = new Date(`${dateString}T12:00:00`); 
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Show notification when server response arrives
  useEffect(() => {
    if (state?.message) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <Paper withBorder shadow="lg" p="xl" radius="md" my="xl" id="rsvp">
      <Title order={2} c="gray.9" ta="center" mb="lg">Confirme sua Presença</Title>
      <Text ta="center" c="dimmed" mb="xl">
        Por favor, preencha os dados abaixo para garantir seu lugar.
      </Text>
      
      <form action={formAction}>
        <Stack gap="lg">
          {/* Hidden ID to link RSVP to Event */}
          <input type="hidden" name="eventId" value={eventId} />
          
          <TextInput
            name="guestName"
            label="Seu nome completo"
            placeholder="Digite seu nome"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="md"
          />
          
          <Box>
            <Text fw={500} size="sm" mb="xs">Quais datas você estaria disponível? *</Text>
            <Text size="sm" c="dimmed" mb="md">Marque todas as opções em que você pode participar.</Text>
            <Stack gap="sm">
              {availableDates.map((dateStr) => (
                <Checkbox
                  key={dateStr}
                  name="selectedDates"
                  value={dateStr}
                  label={formatDate(dateStr)}
                  size="md"
                  styles={{ label: { textTransform: 'capitalize' } }}
                />
              ))}
            </Stack>
          </Box>

          {/* Conditional +1 Section */}
          {hasPlusOne && (
            <Box p="md" bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
              <Checkbox
                name="bringingGuest"
                label="Vou levar um(a) acompanhante (+1)"
                size="md"
                checked={bringingGuest}
                onChange={(e) => setBringingGuest(e.currentTarget.checked)}
              />
              
              <Collapse in={bringingGuest} mt="md">
                <TextInput
                  name="plusOneName"
                  label="Nome do(a) acompanhante"
                  placeholder="Nome completo do convidado"
                  required={bringingGuest}
                  size="md"
                  bg="white"
                />
              </Collapse>
            </Box>
          )}
          
          {/* Success/Error Notification */}
          <Collapse in={showNotification}>
            <Notification
              icon={state?.status === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
              color={state?.status === 'success' ? 'green' : 'red'}
              title={state?.status === 'success' ? 'Sucesso!' : 'Atenção'}
              onClose={() => setShowNotification(false)}
              withBorder
            >
              {state?.message}
            </Notification>
          </Collapse>

          <SubmitButton />
        </Stack>
      </form>
    </Paper>
  );
}