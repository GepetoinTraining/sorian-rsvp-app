'use client';

import { Button, ButtonProps } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';

interface BackButtonProps extends ButtonProps {
  href: string;
  children: ReactNode;
}

export function BackButton({ href, children, ...props }: BackButtonProps) {
  return (
    <Button component={Link} href={href} {...props}>
      {children}
    </Button>
  );
}