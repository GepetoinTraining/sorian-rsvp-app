// components/Header.tsx
'use client';

import { Container, Group, Button, Title, Anchor, Menu } from '@mantine/core';
import { IconLogout, IconUser, IconSettings, IconToolsKitchen2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header style={{ 
      borderBottom: '1px solid var(--mantine-color-gray-2)', 
      paddingBlock: '1rem', 
      backgroundColor: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Container size="lg">
        <Group justify="space-between">
          {/* Brand Logo */}
          <Title order={3} style={{ fontFamily: 'var(--font-playfair), serif' }}>
            <Anchor component={Link} href="/" underline="never" c="red.9">
              Sorian-RSVP
            </Anchor>
          </Title>

          <Group>
            {session ? (
              // Logged In View (Admin)
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle" color="gray" leftSection={<IconUser size={18} />}>
                    {session.user.name || 'Admin'}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Gerenciamento</Menu.Label>
                  <Menu.Item component={Link} href="/admin/dashboard" leftSection={<IconSettings size={14} />}>
                    Dashboard
                  </Menu.Item>
                  <Menu.Item component={Link} href="/admin/plates" leftSection={<IconToolsKitchen2 size={14} />}>
                    Gerenciar Pratos
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    color="red" 
                    leftSection={<IconLogout size={14} />}
                    onClick={() => signOut()}
                  >
                    Sair
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              // Public View
              <Button component={Link} href="/auth/login" variant="subtle" color="gray" size="sm">
                Área Restrita
              </Button>
            )}
          </Group>
        </Group>
      </Container>
    </header>
  );
}