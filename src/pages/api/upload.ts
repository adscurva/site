// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Desabilita bodyParser do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function upload(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- Iniciando a API de upload ---');

  if (req.method !== 'POST') {
    console.error('Método não permitido:', req.method);
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Formidable para lidar com upload de arquivos grandes
  const form = new IncomingForm({
    maxFileSize: 500 * 1024 * 1024, // 500 MB
  });

  try {
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Erro ao fazer o parse do formulário:', err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    console.log('Formulário processado. Arquivos encontrados:', files);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      console.error('Nenhum arquivo encontrado ou filepath ausente.');
      return res.status(400).json({ message: 'Nenhum arquivo enviado ou inválido.' });
    }

    console.log(`Arquivo recebido: ${file.originalFilename} (tipo: ${file.mimetype}).`);

    // Determina o tipo de recurso para o Cloudinary
    const resourceType = file.mimetype.startsWith('video/')
      ? 'video'
      : file.mimetype === 'application/pdf'
        ? 'raw' // PDFs e outros arquivos não suportados como imagem
        : 'auto'; // imagens

    // Upload para o Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: 'dresses',
      resource_type: resourceType,
    });

    console.log('Upload para o Cloudinary bem-sucedido. URL:', uploadResult.secure_url);

    // Remove arquivo temporário
    fs.unlinkSync(file.filepath);
    console.log('Arquivo temporário excluído:', file.filepath);

    // Retorna dados para o front-end
    return res.status(200).json({
      url: uploadResult.secure_url,
      filename: file.originalFilename,
      mimetype: file.mimetype,
    });
  } catch (err: any) {
    console.error('Erro geral no upload:', err);
    return res.status(500).json({
      message: 'Erro interno do servidor ao processar o upload.',
      error: err.message || 'Erro desconhecido',
    });
  } finally {
    console.log('--- Fim da API de upload ---');
  }
}
