'use client';

import { Suspense } from 'react';
import { HomePageClient } from './HomePageClient';

function HomePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HomePageClient />
    </Suspense>
  );
}

export default HomePage;