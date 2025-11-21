'use server';

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema for validation
const rsvpSchema = z.object({
  eventId: z.string().cuid(),
  guestName: z.string().min(2, "O nome é obrigatório"),
  bringingGuest: z.boolean(),
  plusOneName: z.string().optional(),
  selectedDates: z.array(z.string()).min(1, "Selecione pelo menos uma data"),
});

export async function submitRsvp(prevState: any, formData: FormData) {
  // 1. Extract Data from FormData
  const rawData = {
    eventId: formData.get('eventId') as string,
    guestName: formData.get('guestName') as string,
    // Checkbox sends 'on' if checked, null otherwise
    bringingGuest: formData.get('bringingGuest') === 'on', 
    plusOneName: formData.get('plusOneName') as string,
    // getAll retrieves all values for checkboxes with the same name
    selectedDates: formData.getAll('selectedDates') as string[],
  };

  // 2. Validate
  const result = rsvpSchema.safeParse(rawData);

  if (!result.success) {
    return {
      status: 'error',
      message: "Por favor, preencha todos os campos obrigatórios.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { eventId, guestName, bringingGuest, plusOneName, selectedDates } = result.data;

  try {
  // 3. Database Interaction
  await prisma.rSVP.create({
    data: {
      eventId,
      // Map Form variables -> New DB Columns
      participantName: guestName, 
      hasPlusOne: bringingGuest,
      plusOneName: bringingGuest ? plusOneName : null,
      selectedDate: selectedDates.join(', '),
    },
  });

  // 4. Revalidate Cache
  revalidatePath(`/event/${eventId}`);

  return { status: 'success', message: "Presença confirmada com sucesso!" };
} catch (error) {
  console.error("RSVP Error:", error);
  return { status: 'error', message: "Erro ao salvar confirmação. Tente novamente." };
}
}