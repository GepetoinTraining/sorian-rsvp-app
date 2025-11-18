// app/auth/register/page.tsx
'use client';

import { TextInput, PasswordInput, Button, Stack, Alert, Anchor } from '@mantine/core';
import { useActionState, useEffect } from 'react';
import { registerUser } from '../actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconAlertCircle } from '@tabler/icons-react';

type RegisterState = {
  success: boolean;
  error?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
};

const initialState: RegisterState = { success: false, error: {} };

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser as any, initialState); 
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push('/auth/login?registered=true');
    }
  }, [state.success, router]);

  return (
    <form action={formAction}>
      <Stack>
        {state.error?._form && (
          <Alert color="red" title="Erro no Registro" icon={<IconAlertCircle size={16} />}>
            {state.error._form[0]}
          </Alert>
        )}

        <TextInput
          label="Seu Nome ou Empresa"
          name="name"
          placeholder="Seu Nome"
          required
          error={state.error?.name?.[0]}
        />
        <TextInput
          label="Email (Será seu login)"
          name="email"
          type="email"
          placeholder="admin@sorian-rsvp.com"
          required
          error={state.error?.email?.[0]}
        />
        <PasswordInput
          label="Senha"
          name="password"
          placeholder="Pelo menos 8 caracteres"
          required
          error={state.error?.password?.[0]}
        />
        <Button type="submit" fullWidth>
          Criar Conta Admin
        </Button>
        <Anchor component={Link} href="/auth/login" ta="center">
          Já tem uma conta? Faça login
        </Anchor>
      </Stack>
    </form>
  );
}