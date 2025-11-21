// app/admin/actions.ts
'use server';

import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// 1. Updated Zod Schema
const eventSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  dressCode: z.string().optional(),
  // Updated Location fields
  locationAddress: z.string().min(3, "Endereço obrigatório"),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  imageUrl: z.string().optional(),
  hasPlusOne: z.boolean().optional(),
  availableDates: z.array(z.string()).min(1, "Selecione pelo menos uma data"),
  
  // NEW: Menu Sections defined first
  menuSections: z.array(z.object({
    tempId: z.string(), // Client-side ID for tracking
    title: z.string().min(1, "Título da seção obrigatório"),
    imageUrl: z.string().optional(),
    order: z.number().default(0),
  })).optional().default([]),

  // Updated: Menu Items link to section tempIds
  menuItems: z.array(z.object({
    title: z.string().min(1, "Título do prato obrigatório"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    sectionTempId: z.string().optional().nullable(), // Links to menuSections.tempId
  })).optional().default([]),

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


// Helper to parse form data
const parseFormData = (formData: FormData) => {
    const parseJson = (key: string) => {
        const val = formData.get(key);
        if (typeof val !== 'string' || !val) return [];
        try { return JSON.parse(val); } catch { return []; }
    };

    return {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        dressCode: formData.get('dressCode') as string,
        // New Location handling
        locationAddress: formData.get('locationAddress') as string,
        locationLat: formData.get('locationLat') ? parseFloat(formData.get('locationLat') as string) : null,
        locationLng: formData.get('locationLng') ? parseFloat(formData.get('locationLng') as string) : null,

        imageUrl: formData.get('imageUrl') as string,
        hasPlusOne: formData.get('hasPlusOne') === 'true',
        availableDates: parseJson('availableDates'),
        menuSections: parseJson('menuSections'), // New
        menuItems: parseJson('menuItems'),
        speakers: parseJson('speakers'),
        timeline: parseJson('timeline'),
        participants: parseJson('participants'),
    };
}


export async function createEvent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  const rawData = parseFormData(formData);
  const result = eventSchema.safeParse(rawData);

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors);
    return { success: false, message: "Erro de validação", errors: result.error.flatten().fieldErrors };
  }

  try {
    // Transaction is crucial here
    await prisma.$transaction(async (tx) => {
        // 1. Create Event Base
        const event = await tx.event.create({
            data: {
                userId: session.user.id,
                name: result.data.name,
                description: result.data.description,
                dressCode: result.data.dressCode,
                locationAddress: result.data.locationAddress,
                locationLat: result.data.locationLat,
                locationLng: result.data.locationLng,
                imageUrl: result.data.imageUrl,
                hasPlusOne: result.data.hasPlusOne,
                availableDates: result.data.availableDates,
                // Create simple relations directly
                speakers: { create: result.data.speakers },
                timeline: { create: result.data.timeline },
                participants: { create: result.data.participants },
            },
        });

        // 2. Handle Menu Relations (Complex part)
        // Map client tempIds to real DB Ids
        const sectionMap = new Map<string, string>(); 

        // a) Create sections sequentially to get their real IDs
        for (const sectionData of result.data.menuSections) {
            const createdSection = await tx.menuSection.create({
                data: {
                    eventId: event.id,
                    title: sectionData.title,
                    imageUrl: sectionData.imageUrl,
                    order: sectionData.order,
                }
            });
            // Map temp ID to real DB ID
            sectionMap.set(sectionData.tempId, createdSection.id);
        }

        // b) Create items linking to real section IDs
        const itemsToCreate = result.data.menuItems.map(item => ({
            eventId: event.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            // Look up real ID if a temp ID exists
            sectionId: item.sectionTempId ? sectionMap.get(item.sectionTempId) : null,
        }));

        if (itemsToCreate.length > 0) {
            await tx.menuItem.createMany({ data: itemsToCreate });
        }
    });

    revalidatePath('/admin/dashboard');
  } catch (error) {
    console.error("Create Error:", error);
    // Useful for debugging transaction failures
    // if (error instanceof Error) return { success: false, message: error.message }; 
    return { success: false, message: "Erro ao criar evento." };
  }

  redirect('/admin/dashboard');
}

export async function updateEvent(eventId: string, prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Não autorizado" };

    const rawData = parseFormData(formData);
    const result = eventSchema.safeParse(rawData);

    if (!result.success) {
        return { success: false, message: "Erro de validação", errors: result.error.flatten().fieldErrors };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            await tx.event.update({
                where: { id: eventId },
                data: {
                    name: result.data.name,
                    description: result.data.description,
                    dressCode: result.data.dressCode,
                    locationAddress: result.data.locationAddress,
                    locationLat: result.data.locationLat,
                    locationLng: result.data.locationLng,
                    imageUrl: result.data.imageUrl,
                    hasPlusOne: result.data.hasPlusOne,
                    availableDates: result.data.availableDates,
                }
            });

            // 2. Clear ALL old relations (Full Replace Strategy)
            // Nuke items first due to foreign key constraints
            await tx.menuItem.deleteMany({ where: { eventId } });
            // Then nuke sections
            await tx.menuSection.deleteMany({ where: { eventId } });
            // Other simple relations
            await tx.speaker.deleteMany({ where: { eventId } });
            await tx.timelineItem.deleteMany({ where: { eventId } });
            await tx.participant.deleteMany({ where: { eventId } });

            // 3. Re-create relations using the same logic as createEvent
            const sectionMap = new Map<string, string>(); 

            for (const sectionData of result.data.menuSections) {
                const createdSection = await tx.menuSection.create({
                    data: {
                        eventId: eventId,
                        title: sectionData.title,
                        imageUrl: sectionData.imageUrl,
                        order: sectionData.order,
                    }
                });
                sectionMap.set(sectionData.tempId, createdSection.id);
            }

            const itemsToCreate = result.data.menuItems.map(item => ({
                eventId: eventId,
                title: item.title,
                description: item.description,
                imageUrl: item.imageUrl,
                sectionId: item.sectionTempId ? sectionMap.get(item.sectionTempId) : null,
            }));

            if (itemsToCreate.length > 0) {
                await tx.menuItem.createMany({ data: itemsToCreate });
            }
            
            // Re-create simple relations
             await tx.event.update({
                where: { id: eventId },
                data: {
                  speakers: { create: result.data.speakers },
                  timeline: { create: result.data.timeline },
                  participants: { create: result.data.participants },
                }
            })
        });


        revalidatePath('/admin/dashboard');
        revalidatePath(`/event/${eventId}`);
    } catch (error) {
        console.error("Update Error:", error);
        return { success: false, message: "Erro ao atualizar evento." };
    }

    redirect('/admin/dashboard');
}