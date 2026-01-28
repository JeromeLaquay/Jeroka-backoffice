const pdfParse = require('pdf-parse');
const puppeteer = require('puppeteer');
import { GoogleDriveService } from '../google/googleDriveService';
import fs from 'fs';
import path from 'path';

export class AnalyzeDocuments {
  static async extractDataFromPdf(attachmentData: any) {
    try {
      let fileBuffer: Buffer;
      
      // Si c'est une chaîne base64, la convertir en Buffer
      if (typeof attachmentData === 'string') {
        fileBuffer = Buffer.from(attachmentData, 'base64');
      } else if (Buffer.isBuffer(attachmentData)) {
        // Si c'est déjà un Buffer, l'utiliser directement
        fileBuffer = attachmentData;
      } else {
        // Si c'est un stream, le traiter comme avant
        const chunks = [];
        for await (const chunk of attachmentData) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      }
      
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('Erreur lors de l\'extraction des données PDF:', error);
      throw new Error(`Impossible d'extraire le texte du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  static async downloadPdfFromDrive(credentials: any, fileId: string): Promise<Buffer | null> {
    try {
      const fileStream = await GoogleDriveService.getFileStream(credentials, fileId);
      if (!fileStream) return null;

      // Utiliser une approche plus simple avec stream-to-buffer
      const chunks: any[] = [];
      return new Promise((resolve, reject) => {
        fileStream.stream.on('data', (chunk: any) => {
          chunks.push(chunk);
        });
        
        fileStream.stream.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
          } catch (error) {
            reject(error);
          }
        });
        
        fileStream.stream.on('error', (error: any) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      return null;
    }
  }

  static async generatePdfScreenshot(pdfBuffer: Buffer): Promise<string | null> {
    // Pour l'instant, on désactive la capture d'écran car Puppeteer pose des problèmes en Docker
    // On peut l'activer plus tard quand l'environnement sera stabilisé
    console.log('Capture d\'écran désactivée temporairement');
    return null;
    
    /* Code commenté pour référence future
    let browser;
    let tempPdfPath: string | null = null;
    try {
      browser = await puppeteer.launch({ 
        headless: "new",
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        timeout: 30000
      });
      
      const page = await browser.newPage();
      
      // Créer un fichier temporaire
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);
      
      // Charger le PDF dans la page
      await page.goto(`file://${tempPdfPath}`, { waitUntil: 'networkidle0' });
      
      // Prendre une capture d'écran de la première page
      const screenshot = await page.screenshot({ 
        type: 'png',
        fullPage: true,
        encoding: 'base64'
      });
      
      return screenshot as string;
    } catch (error) {
      console.error('Erreur lors de la génération de capture d\'écran:', error);
      return null;
    } finally {
      // Nettoyer le fichier temporaire
      if (tempPdfPath && fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }
      // Fermer le navigateur de manière sécurisée
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Erreur lors de la fermeture du navigateur:', closeError);
        }
      }
    }
    */
  }

  static async analyzePdfFromDrive(credentials: any, fileId: string, companyName: string, companyInfos: string) {
    try {
      // Télécharger le PDF depuis Google Drive
      const pdfBuffer = await this.downloadPdfFromDrive(credentials, fileId);
      if (!pdfBuffer) throw new Error('Impossible de télécharger le PDF');

      // Extraire le texte
      const extractedText = await this.extractDataFromPdf(pdfBuffer);
      
      // Générer une capture d'écran
      const screenshot = await this.generatePdfScreenshot(pdfBuffer);
      
      return {
        extractedText,
        screenshot,
        pdfBuffer
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse du PDF:', error);
      throw error;
    }
  }

  static async analyzePdfWithIA(credentials: any, fileId: string, companyName: string, companyInfos: string) {
    try {
      // Analyser le PDF (texte + capture d'écran)
      const analysis = await this.analyzePdfFromDrive(credentials, fileId, companyName, companyInfos);
      
      // Importer DocumentIAService dynamiquement pour éviter les dépendances circulaires
      const { DocumentIAService } = await import('../ia/DocumentIAService');
      
      // Analyser avec l'IA (texte + image)
      const iaResult = await DocumentIAService.analyseDocument(
        analysis.extractedText, 
        companyName, 
        companyInfos, 
        analysis.screenshot || undefined
      );
      
      return {
        ...analysis,
        iaAnalysis: iaResult
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA du PDF:', error);
      throw error;
    }
  }
}
export default AnalyzeDocuments;