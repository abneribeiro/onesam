import puppeteer, { Browser } from 'puppeteer';
import crypto from 'crypto';
import { certificadoRepository } from '../repositories/certificadoRepository';
import { cursoRepository } from '../repositories/cursoRepository';
import { utilizadorRepository } from '../repositories/utilizadorRepository';
import { aulaService } from './aulaService';
import logger from '../utils/logger';
import type { Certificado, NewCertificado } from '../types';

export interface CertificadoData {
  utilizadorNome: string;
  cursoNome: string;
  dataEmissao: string;
  codigoHash: string;
}

export class CertificadoService {
  /**
   * Generates a unique hash code for the certificate
   */
  private gerarCodigoHash(utilizadorId: number, cursoId: number): string {
    const timestamp = Date.now().toString();
    const data = `${utilizadorId}-${cursoId}-${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Checks if user has completed the course (100% progress)
   */
  async podeGerarCertificado(utilizadorId: number, cursoId: number): Promise<boolean> {
    try {
      const progresso = await aulaService.calcularProgressoCurso(cursoId, utilizadorId);
      return progresso.percentual >= 100;
    } catch (error) {
      logger.error('Erro ao verificar elegibilidade para certificado', { utilizadorId, cursoId, error });
      return false;
    }
  }

  /**
   * Creates a new certificate for a user and course
   */
  async gerarCertificado(utilizadorId: number, cursoId: number): Promise<Certificado> {
    try {
      // Check if certificate already exists
      const certificadoExistente = await certificadoRepository.findByUserAndCourse(utilizadorId, cursoId);
      if (certificadoExistente) {
        return certificadoExistente;
      }

      // Check if user can generate certificate
      const podeGerar = await this.podeGerarCertificado(utilizadorId, cursoId);
      if (!podeGerar) {
        throw new Error('Utilizador não completou o curso');
      }

      // Generate certificate hash
      const codigoHash = this.gerarCodigoHash(utilizadorId, cursoId);

      // Create certificate record
      const certificadoData: NewCertificado = {
        utilizadorId,
        cursoId,
        codigoHash,
        dataEmissao: new Date()
      };

      const certificado = await certificadoRepository.create(certificadoData);
      logger.info('Certificado gerado com sucesso', { utilizadorId, cursoId, certificadoId: certificado.id });

      return certificado;
    } catch (error) {
      logger.error('Erro ao gerar certificado', { utilizadorId, cursoId, error });
      throw error;
    }
  }

  /**
   * Gets certificate data for PDF generation
   */
  async obterDadosCertificado(codigoHash: string): Promise<CertificadoData | null> {
    try {
      const certificado = await certificadoRepository.findByHash(codigoHash);
      if (!certificado) {
        return null;
      }

      const [utilizador, curso] = await Promise.all([
        utilizadorRepository.findById(certificado.utilizadorId),
        cursoRepository.findById(certificado.cursoId)
      ]);

      if (!utilizador || !curso) {
        return null;
      }

      return {
        utilizadorNome: utilizador.nome,
        cursoNome: curso.nome,
        dataEmissao: certificado.dataEmissao.toLocaleDateString('pt-PT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        codigoHash: certificado.codigoHash
      };
    } catch (error) {
      logger.error('Erro ao obter dados do certificado', { codigoHash, error });
      return null;
    }
  }

  /**
   * Generates PDF certificate
   */
  async gerarPDF(codigoHash: string): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      const dados = await this.obterDadosCertificado(codigoHash);
      if (!dados) {
        throw new Error('Certificado não encontrado');
      }

      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Set page format
      await page.setViewport({ width: 1200, height: 800 });

      // Generate HTML content
      const html = this.gerarHTMLCertificado(dados);

      // Set content and generate PDF
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }
      });

      return Buffer.from(pdf);
    } catch (error) {
      logger.error('Erro ao gerar PDF do certificado', { codigoHash, error });
      throw new Error('Erro interno ao gerar certificado');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generates HTML template for certificate
   */
  private gerarHTMLCertificado(dados: CertificadoData): string {
    return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado - OneSAM</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
            }

            .certificate {
                background: white;
                width: 800px;
                height: 600px;
                border: 20px solid #f8f9fa;
                border-radius: 15px;
                padding: 60px 40px;
                text-align: center;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            }

            .certificate::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                border-radius: 20px;
                z-index: -1;
            }

            .header {
                margin-bottom: 30px;
            }

            .logo {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 10px;
            }

            .subtitle {
                font-size: 14px;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .title {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: #2c3e50;
                margin: 40px 0 30px;
                text-transform: uppercase;
                letter-spacing: 3px;
            }

            .recipient {
                font-size: 18px;
                color: #34495e;
                margin-bottom: 15px;
            }

            .name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #2c3e50;
                margin: 20px 0;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
                display: inline-block;
            }

            .course {
                font-size: 16px;
                color: #34495e;
                margin: 30px 0;
                line-height: 1.6;
            }

            .course-name {
                font-weight: 600;
                color: #2c3e50;
                font-size: 20px;
            }

            .footer {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .date {
                font-size: 14px;
                color: #7f8c8d;
            }

            .validation {
                font-size: 12px;
                color: #7f8c8d;
                text-align: right;
            }

            .code {
                font-family: 'Courier New', monospace;
                background: #ecf0f1;
                padding: 5px 10px;
                border-radius: 4px;
                margin-top: 5px;
                font-weight: bold;
                color: #2c3e50;
            }

            .decorative-line {
                height: 2px;
                background: linear-gradient(90deg, transparent, #3498db, transparent);
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <div class="logo">OneSAM</div>
                <div class="subtitle">Sistema de Aprendizagem e Gestão</div>
            </div>

            <div class="title">Certificado</div>

            <div class="decorative-line"></div>

            <div class="recipient">
                Certifica-se que
            </div>

            <div class="name">${dados.utilizadorNome}</div>

            <div class="course">
                concluiu com sucesso o curso<br>
                <span class="course-name">${dados.cursoNome}</span>
            </div>

            <div class="decorative-line"></div>

            <div class="footer">
                <div class="date">
                    ${dados.dataEmissao}
                </div>
                <div class="validation">
                    Código de Validação<br>
                    <div class="code">${dados.codigoHash.substring(0, 16).toUpperCase()}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Validates a certificate by its hash
   */
  async validarCertificado(codigoHash: string): Promise<{
    valido: boolean;
    dados?: CertificadoData;
    erro?: string;
  }> {
    try {
      const dados = await this.obterDadosCertificado(codigoHash);

      if (!dados) {
        return {
          valido: false,
          erro: 'Certificado não encontrado'
        };
      }

      return {
        valido: true,
        dados
      };
    } catch (error) {
      logger.error('Erro ao validar certificado', { codigoHash, error });
      return {
        valido: false,
        erro: 'Erro interno de validação'
      };
    }
  }

  /**
   * Lists certificates for a user
   */
  async listarCertificadosUtilizador(utilizadorId: number): Promise<Certificado[]> {
    try {
      return await certificadoRepository.findByUserId(utilizadorId);
    } catch (error) {
      logger.error('Erro ao listar certificados do utilizador', { utilizadorId, error });
      throw new Error('Erro ao listar certificados');
    }
  }

  /**
   * Auto-generates certificate when course is completed
   */
  async verificarEGerarCertificadoAutomatico(utilizadorId: number, cursoId: number): Promise<Certificado | null> {
    try {
      // Check if course is marked as issuing certificates
      const curso = await cursoRepository.findById(cursoId);
      if (!curso?.certificado) {
        return null; // Course doesn't issue certificates
      }

      const podeGerar = await this.podeGerarCertificado(utilizadorId, cursoId);
      if (!podeGerar) {
        return null; // User hasn't completed the course
      }

      // Check if certificate already exists
      const certificadoExistente = await certificadoRepository.findByUserAndCourse(utilizadorId, cursoId);
      if (certificadoExistente) {
        return certificadoExistente;
      }

      // Generate certificate automatically
      return await this.gerarCertificado(utilizadorId, cursoId);
    } catch (error) {
      logger.error('Erro na geração automática de certificado', { utilizadorId, cursoId, error });
      return null;
    }
  }
}

export const certificadoService = new CertificadoService();