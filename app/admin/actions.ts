'use server';

import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  dressCode: z.string().optional(),
  locationInfo: z.string().optional(),
  imageUrl: z.string().optional(),
  hasPlusOne: z.boolean().optional(),
  availableDates: z.array(z.string()).min(1, "Selecione pelo menos uma data"),
  
  // Relations
  menuItems: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
  
  speakers: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    bio: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),

  timeline: z.array(z.object({
    time: z.string(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(0),
  })).optional(),

  participants: z.array(z.object({
    name: z.string(),
  })).optional(),
});

export async function createEvent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, message: "Você precisa estar logado." };
  }

  // Helper to safely parse JSON from FormData
  const parseJson = (key: string) => {
    const val = formData.get(key);
    if (typeof val !== 'string' || !val) return [];
    try { return JSON.parse(val); } catch { return []; }
  };

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    dressCode: formData.get('dressCode') as string,
    locationInfo: formData.get('locationInfo') as string,
    imageUrl: formData.get('imageUrl') as string,
    // Boolean check for switch
    hasPlusOne: formData.get('hasPlusOne') === 'true',
    availableDates: parseJson('availableDates'),
    menuItems: parseJson('menuItems'),
    speakers: parseJson('speakers'),
    timeline: parseJson('timeline'),
    participants: parseJson('participants'),
  };

  const result = eventSchema.safeParse(rawData);

  if (!result.success) {
    console.error(result.error.flatten());
    return { 
      success: false, 
      message: "Erro de validação", 
      errors: result.error.flatten().fieldErrors 
    };
  }

  try {
    await prisma.event.create({
      data: {
        userId: session.user.id,
        name: result.data.name,
        description: result.data.description,
        dressCode: result.data.dressCode,
        locationInfo: result.data.locationInfo,
        imageUrl: result.data.imageUrl,
        availableDates: result.data.availableDates,
        hasPlusOne: result.data.hasPlusOne || false,
        
        menuItems: {
          create: result.data.menuItems?.map(item => ({
            title: item.title,
            description: item.description || "",
            imageUrl: item.imageUrl || "",
          }))
        },
        speakers: {
          create: result.data.speakers?.map(s => ({
            name: s.name,
            role: s.role || "",
            bio: s.bio || "",
            imageUrl: s.imageUrl || "",
          }))
        },
        timeline: {
          create: result.data.timeline?.map(t => ({
            time: t.time,
            title: t.title,
            description: t.description || "",
            order: Number(t.order) || 0,
          }))
        },
        participants: {
          create: result.data.participants?.map(p => ({
            name: p.name
          }))
        }
      },
    });

    revalidatePath('/events');
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Erro ao criar evento no banco de dados." };
  }

  redirect('/admin/dashboard');
}