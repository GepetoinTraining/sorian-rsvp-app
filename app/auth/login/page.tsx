// app/auth/login/page.tsx
'use client';

import { TextInput, PasswordInput, Button, Stack, Alert, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Default redirect path is the admin dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'; 
  const justRegistered = searchParams.get('registered') === 'true';

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Email inválido'),
      password: (val) => (val.length < 8 ? 'A senha deve ter pelo menos 8 caracteres' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        ...values,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos.");
      } else {
        router.push(callbackUrl);
      }

    } catch (e) {
      console.error(e); 
      setError("Ocorreu um erro inesperado. Tente novamente.");
    
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {justRegistered && (
          <Alert color="green" title="Sucesso!">
            Conta criada! Faça login para continuar.
          </Alert>
        )}
        {error && (
          <Alert color="red" title="Erro no Login">
            {error}
          </Alert>
        )}

        <TextInput
          label="Email"
          type="email"
          placeholder="admin@sorian-rsvp.com"
          required
          {...form.getInputProps('email')}
          disabled={isLoading}
        />
        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          required
          {...form.getInputProps('password')}
          disabled={isLoading}
        />
        <Button type="submit" fullWidth loading={isLoading}>
          Entrar
        </Button>
        <Anchor component={Link} href="/auth/register" ta="center">
          Não tem uma conta? Crie agora
        </Anchor>
      </Stack>
    </form>
  );
}