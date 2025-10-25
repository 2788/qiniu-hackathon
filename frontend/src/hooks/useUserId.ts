'use client';

import { useEffect, useState } from 'react';
import { getUserId } from '@/lib/user-id';

export function useUserId() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  return userId;
}
