// app/admin/actions.ts
'use server';

import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// 1. Validation Schema
const eventSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  dressCode: z.string().optional(),
  locationInfo: z.string().optional(),
  imageUrl: z.string().url("URL da imagem inválida").optional().or(z.literal('')),
  availableDates: z.array(z.string()).min(1, "Selecione pelo menos uma data"),
});

export async function createEvent(prevState: any, formData: FormData) {
  // 2. Check Auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Você precisa estar logado." };
  }

  // 3. Extract Data
  // We expect the form to send a JSON string for complex data handling, 
  // or we extract standard fields. Since we built a JSON/Form hybrid, 
  // let's assume we submit the raw JSON string for simplicity, or parse standard fields.
  // Here we will extract standard fields assuming the Client component unpacks them,
  // OR we handle the "json_payload" approach.
  
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    dressCode: formData.get('dressCode') as string,
    locationInfo: formData.get('locationInfo') as string,
    imageUrl: formData.get('imageUrl') as string,
    // Dates are tricky in FormData, we'll expect them as a JSON string or separate fields
    availableDates: formData.get('availableDates') 
      ? JSON.parse(formData.get('availableDates') as string) 
      : [],
  };

  // 4. Validate
  const result = eventSchema.safeParse(rawData);

  if (!result.success) {
    return { 
      success: false, 
      message: "Erro de validação", 
      errors: result.error.flatten().fieldErrors 
    };
  }

  try {
    // 5. Database Insert
    const newEvent = await prisma.event.create({
      data: {
        userId: session.user.id,
        ...result.data,
      },
    });

    revalidatePath('/events');
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao criar evento no banco de dados." };
  }

  // 6. Redirect on Success
  redirect('/events');
}