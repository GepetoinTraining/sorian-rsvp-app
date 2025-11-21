'use server';

import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const plateSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  preparation: z.string().optional(),
  dietaryTags: z.array(z.string()),
  imageUrl: z.string().optional(),
});

export async function updatePlate(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Não autorizado" };

  const rawData = {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    ingredients: formData.get('ingredients') as string,
    preparation: formData.get('preparation') as string,
    dietaryTags: formData.getAll('dietaryTags') as string[],
    imageUrl: formData.get('imageUrl') as string,
  };

  const result = plateSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, message: "Erro de validação", errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verify ownership via Event -> User
    const existingPlate = await prisma.menuItem.findFirst({
      where: {
        id: result.data.id,
        event: { userId: session.user.id }
      }
    });

    if (!existingPlate) {
      return { success: false, message: "Prato não encontrado ou sem permissão." };
    }

    await prisma.menuItem.update({
      where: { id: result.data.id },
      data: {
        title: result.data.title,
        description: result.data.description,
        ingredients: result.data.ingredients,
        preparation: result.data.preparation,
        dietaryTags: result.data.dietaryTags,
        imageUrl: result.data.imageUrl,
      }
    });

    revalidatePath('/admin/plates');
    revalidatePath(`/event/${existingPlate.eventId}`);
    return { success: true, message: "Prato atualizado com sucesso!" };

  } catch (error) {
    console.error("Plate Update Error:", error);
    return { success: false, message: "Erro ao atualizar o prato." };
  }
}