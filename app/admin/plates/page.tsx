import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { Container, Title, Text, Stack } from '@mantine/core';
import { PlatesManager } from './PlatesManager';

export default async function AdminPlatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Fetch all menu items linked to events created by the user
  const plates = await prisma.menuItem.findMany({
    where: {
      event: {
        userId: session.user.id
      }
    },
    include: {
      event: {
        select: { name: true }
      }
    },
    orderBy: {
      title: 'asc'
    }
  });

  return (
    <>
      <Header />
      <Container size="lg" py="xl">
        <Stack gap="lg">
            <div>
                <Title order={2}>Gerenciador de Pratos</Title>
                <Text c="dimmed">Edite receitas, fotos e etiquetas de todos os seus eventos em um só lugar.</Text>
            </div>
            
            <PlatesManager initialPlates={plates} />
        </Stack>
      </Container>
    </>
  );
}