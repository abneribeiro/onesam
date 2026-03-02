'use client';

import { useState } from 'react';
import { useValidarCertificado } from '@/hooks/queries/useCertificados';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Hash
} from 'lucide-react';

export default function ValidarCertificadoPage() {
  const [codigo, setCodigo] = useState('');
  const [shouldValidate, setShouldValidate] = useState(false);

  const { data: certificado, isLoading, error, refetch } = useValidarCertificado(
    shouldValidate ? codigo : ''
  );

  const handleValidar = () => {
    if (codigo.trim()) {
      setShouldValidate(true);
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidar();
    }
  };

  const resetValidation = () => {
    setCodigo('');
    setShouldValidate(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-blue-100 text-blue-600">
              <Award className="h-12 w-12" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Validação de Certificado</h1>
            <p className="text-gray-600 mt-2">
              Verifique a autenticidade de um certificado OneSAM
            </p>
          </div>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Inserir Código de Validação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Insira o código de validação do certificado"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                onKeyPress={handleKeyPress}
                className="font-mono tracking-wider"
                maxLength={64}
              />
              <Button
                onClick={handleValidar}
                disabled={!codigo.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? 'Validando...' : 'Validar'}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              O código de validação pode ser encontrado no certificado PDF,
              no canto inferior direito.
            </p>

            {shouldValidate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetValidation}
                className="text-blue-600 hover:text-blue-700"
              >
                Nova consulta
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {shouldValidate && (
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
        )}

        {/* Footer Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Sobre a Validação</p>
                <p className="text-blue-700 mt-1">
                  Todos os certificados emitidos pela OneSAM possuem um código único de validação
                  que permite verificar sua autenticidade. Este sistema garante a integridade
                  e confiabilidade dos certificados emitidos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}