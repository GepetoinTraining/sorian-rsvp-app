// app/admin/actions.ts
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
  // Relations...
  menuItems: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    section: z.string().optional(), // Added section here
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
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

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
    hasPlusOne: formData.get('hasPlusOne') === 'true',
    availableDates: parseJson('availableDates'),
    menuItems: parseJson('menuItems'),
    speakers: parseJson('speakers'),
    timeline: parseJson('timeline'),
    participants: parseJson('participants'),
  };

  const result = eventSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, message: "Erro de validação", errors: result.error.flatten().fieldErrors };
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
        hasPlusOne: result.data.hasPlusOne,
        availableDates: result.data.availableDates,
        menuItems: { create: result.data.menuItems },
        speakers: { create: result.data.speakers },
        timeline: { create: result.data.timeline },
        participants: { create: result.data.participants },
      },
    });

    revalidatePath('/admin/dashboard');
  } catch (error) {
    console.error("Create Error:", error);
    return { success: false, message: "Erro ao criar evento." };
  }

  redirect('/admin/dashboard');
}

export async function updateEvent(eventId: string, prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  // Helper to parse JSON
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
    hasPlusOne: formData.get('hasPlusOne') === 'true',
    availableDates: parseJson('availableDates'),
    menuItems: parseJson('menuItems'),
    speakers: parseJson('speakers'),
    timeline: parseJson('timeline'),
    participants: parseJson('participants'),
  };

  const result = eventSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, message: "Erro de validação", errors: result.error.flatten().fieldErrors };
  }

  try {
    // Transaction to clean old relations and add new ones (Full Replace Strategy)
    await prisma.$transaction([
      // 1. Update basic info
      prisma.event.update({
        where: { id: eventId },
        data: {
          name: result.data.name,
          description: result.data.description,
          dressCode: result.data.dressCode,
          locationInfo: result.data.locationInfo,
          imageUrl: result.data.imageUrl,
          hasPlusOne: result.data.hasPlusOne,
          availableDates: result.data.availableDates,
        }
      }),
      // 2. Clear old relations
      prisma.menuItem.deleteMany({ where: { eventId } }),
      prisma.speaker.deleteMany({ where: { eventId } }),
      prisma.timelineItem.deleteMany({ where: { eventId } }),
      prisma.participant.deleteMany({ where: { eventId } }),
      
      // 3. Re-create relations
      prisma.event.update({
        where: { id: eventId },
        data: {
          menuItems: { create: result.data.menuItems },
          speakers: { create: result.data.speakers },
          timeline: { create: result.data.timeline },
          participants: { create: result.data.participants },
        }
      })
    ]);

    revalidatePath('/admin/dashboard');
    revalidatePath(`/event/${eventId}`);
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Erro ao atualizar evento." };
  }

  redirect('/admin/dashboard');
}