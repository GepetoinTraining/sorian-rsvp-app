// app/auth/actions.ts
'use server';

import bcrypt from 'bcryptjs'; // Remember to 'npm install bcryptjs'
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Zod validation schema
const registerSchema = z.object({
  name: z.string().min(3, 'O nome (ou empresa) é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

// Type definition for the action state
type RegisterState = {
  success: boolean;
  error?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[]; 
  };
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> { 
  
  const result = registerSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: { _form: ['Email já cadastrado.'] } };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user (Admin)
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { _form: ['Erro ao criar conta. Tente novamente.'] },
    };
  }
}