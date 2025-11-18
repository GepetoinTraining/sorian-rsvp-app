'use server';

import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schema with Menu Items
const eventSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  dressCode: z.string().optional(),
  locationInfo: z.string().optional(),
  imageUrl: z.string().optional(),
  availableDates: z.array(z.string()).min(1, "Selecione pelo menos uma data"),
  menuItems: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
});

export async function createEvent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Você precisa estar logado." };
  }

  // Parse JSON fields from the hidden inputs
  const availableDatesRaw = formData.get('availableDates') as string;
  const menuItemsRaw = formData.get('menuItems') as string;

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    dressCode: formData.get('dressCode') as string,
    locationInfo: formData.get('locationInfo') as string,
    imageUrl: formData.get('imageUrl') as string,
    availableDates: availableDatesRaw ? JSON.parse(availableDatesRaw) : [],
    menuItems: menuItemsRaw ? JSON.parse(menuItemsRaw) : [],
  };

  const result = eventSchema.safeParse(rawData);

  if (!result.success) {
    return { 
      success: false, 
      message: "Erro de validação", 
      errors: result.error.flatten().fieldErrors 
    };
  }

  try {
    // Create Event AND Menu Items in one transaction
    await prisma.event.create({
      data: {
        userId: session.user.id,
        name: result.data.name,
        description: result.data.description,
        dressCode: result.data.dressCode,
        locationInfo: result.data.locationInfo,
        imageUrl: result.data.imageUrl,
        availableDates: result.data.availableDates,
        // Prisma nested write
        menuItems: {
          create: result.data.menuItems?.map(item => ({
            title: item.title,
            description: item.description || "",
            imageUrl: item.imageUrl || "",
          }))
        }
      },
    });

    revalidatePath('/events');
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao criar evento no banco de dados." };
  }

  redirect('/admin/dashboard');
}