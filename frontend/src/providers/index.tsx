// src/providers/index.tsx
'use client';
import { ReactNode } from 'react';
import  ReduxProvider  from '../redux/ReduxProvider';

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
