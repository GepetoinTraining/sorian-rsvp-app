'use client';

import { Title, Text, Box } from '@mantine/core';

interface EventHeaderProps {
  title: string;
  description: string;
}

export function EventHeader({ title, description }: EventHeaderProps) {
  return (
    <Box ta="center" my="xl">
      <Title 
        order={1} 
        fz={{ base: 40, sm: 50 }} 
        ff="'Playfair Display', serif" 
        c="gray.9"
      >
        {title}
      </Title>
      <Text fz="xl" c="gray.7" mt="md">
        {description}
      </Text>
      <Box w={100} h={4} bg="red.8" mx="auto" mt="xl" />
    </Box>
  );
}