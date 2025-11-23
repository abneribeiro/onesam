'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Página não encontrada</CardTitle>
          <CardDescription className="text-base">
            A página que procura não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => router.push('/')} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Página Anterior
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
