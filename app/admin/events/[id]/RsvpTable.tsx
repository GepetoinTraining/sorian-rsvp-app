'use client';

import { Table, Text, Badge, Group, Stack } from '@mantine/core';

interface RsvpItem {
  id: string;
  guestName: string;
  bringingGuest: boolean;
  plusOneName: string | null;
  selectedDates: string[];
  // We receive the date as a pre-formatted string from the server
  confirmedAtFormatted: string; 
}

interface RsvpTableProps {
  rsvps: RsvpItem[];
}

// Helper to format the 'selectedDates' strings (YYYY-MM-DD)
const formatSelectedDate = (dateStr: string) => {
  // Split string manually to avoid timezone conversion issues
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`; // DD/MM
  }
  return dateStr;
};

export function RsvpTable({ rsvps }: RsvpTableProps) {
  if (rsvps.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed">Nenhuma confirmação recebida ainda.</Text>
      </Stack>
    );
  }

  return (
    <Table striped highlightOnHover verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nome Principal</Table.Th>
          <Table.Th>Acompanhante (+1)</Table.Th>
          <Table.Th>Datas Selecionadas</Table.Th>
          <Table.Th>Confirmado Em</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rsvps.map((rsvp) => (
          <Table.Tr key={rsvp.id}>
            <Table.Td>
              <Text fw={600} c="gray.9">{rsvp.guestName}</Text>
            </Table.Td>
            
            <Table.Td>
              {rsvp.bringingGuest ? (
                <Group gap="xs">
                  <Badge color="green" size="sm" variant="light">Sim</Badge>
                  <Text size="sm">{rsvp.plusOneName}</Text>
                </Group>
              ) : (
                <Badge color="gray" size="sm" variant="outline">Não</Badge>
              )}
            </Table.Td>

            <Table.Td>
              <Group gap={4}>
                {rsvp.selectedDates.map((date) => (
                  <Badge key={date} variant="dot" color="gray">
                    {formatSelectedDate(date)}
                  </Badge>
                ))}
              </Group>
            </Table.Td>

            <Table.Td>
              <Text size="sm" c="dimmed">
                {rsvp.confirmedAtFormatted}
              </Text>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}