'use client';

import { useParams } from 'next/navigation';
import { useValidarCertificado } from '@/hooks/queries/useCertificados';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Hash,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ValidarCertificadoCodigoPage() {
  const params = useParams();
  const codigo = Array.isArray(params.codigo) ? params.codigo[0] : params.codigo;

  const { data: certificado, isLoading, error } = useValidarCertificado(codigo || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-pulse">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Validando certificado...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/validar-certificado">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validação de Certificado</h1>
            <p className="text-gray-600">Resultado da verificação</p>
          </div>
        </div>

        {/* Results */}
        <Card className="overflow-hidden">
          {error ? (
            <CardContent className="py-8">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Certificado não encontrado ou inválido</span>
                  <Badge variant="destructive">
                    Inválido
                  </Badge>
                </AlertDescription>
              </Alert>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Código consultado:</p>
                <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                  {codigo}
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Possíveis motivos:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Código de validação incorreto</li>
                  <li>Certificado não emitido pela OneSAM</li>
                  <li>Código digitado com erro</li>
                </ul>
              </div>
            </CardContent>
          ) : certificado ? (
            <>
              <CardHeader className="bg-green-50 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Certificado Válido
                  </CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Autêntico
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Formando</p>
                    <p className="font-semibold text-lg">{certificado.utilizadorNome}</p>
                  </div>
                </div>

                <Separator />

                {/* Course Info */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Curso</p>
                    <p className="font-semibold">{certificado.cursoNome}</p>
                  </div>
                </div>

                <Separator />

                {/* Emission Date */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Emissão</p>
                    <p className="font-semibold">{certificado.dataEmissao}</p>
                  </div>
                </div>

                <Separator />

                {/* Validation Code */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Código de Validação</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded border break-all">
                      {certificado.codigoHash}
                    </p>
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Este certificado foi verificado e é autêntico
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Emitido pela plataforma OneSAM - Sistema de Aprendizagem e Gestão
                  </p>
                </div>
              </CardContent>
            </>
          ) : null}
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/validar-certificado">
            <Button variant="outline">
              Validar Outro Certificado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}