// app/admin/dashboard/page.tsx
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { DashboardView } from './DashboardView'; // Import the new view

// Define type locally or share from a types file
type EventWithRsvpCount = Prisma.EventGetPayload<{
  include: {
    _count: {
      select: { rsvps: true }
    }
  }
}>;

async function getAdminEvents(userId: string): Promise<EventWithRsvpCount[]> {
  return await prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { rsvps: true }
      }
    }
  });
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/admin/dashboard');
  }

  const events = await getAdminEvents(session.user.id);

  return <DashboardView events={events} session={session} />;
}