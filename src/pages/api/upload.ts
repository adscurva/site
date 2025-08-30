import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Configure o Cloudinary com suas credenciais de forma segura
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Desabilita o bodyParser padrão do Next.js para lidar com uploads de arquivos
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

  const form = new IncomingForm();

  try {
    // Processa o formulário para extrair campos e arquivos
    const { fields, files } = await new Promise<{ fields: any, files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Erro ao fazer o parse do formulário:', err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    console.log('Formulário processado. Arquivos encontrados:', files);

    // Acessa o arquivo. Em `formidable` v3+, `files` é um objeto onde as chaves são os nomes dos campos
    // e os valores são arrays de objetos de arquivo ou um único objeto de arquivo.
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      console.error('Erro: Nenhum arquivo encontrado no formulário ou filepath ausente.');
      return res.status(400).json({ message: 'Nenhum arquivo enviado ou inválido.' });
    }

    console.log(`Arquivo recebido: ${file.originalFilename} (tipo: ${file.mimetype}). Tamanho temporário em: ${file.filepath}`);

    // Faz o upload do arquivo temporário para o Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: 'dresses', // Mantém a pasta 'dresses' conforme seu código original
    });

    console.log('Upload para o Cloudinary bem-sucedido. URL:', uploadResult.secure_url);

    // Exclui o arquivo temporário após o upload
    fs.unlinkSync(file.filepath);
    console.log('Arquivo temporário excluído:', file.filepath);

    // Retorna a URL segura, o nome ORIGINAL do arquivo e o tipo MIME
    // Estes são os dados que a modal espera para salvar no banco de dados
    return res.status(200).json({
      url: uploadResult.secure_url,
      filename: file.originalFilename, // Adicionado: nome original do arquivo
      mimetype: file.mimetype,       // Adicionado: tipo MIME do arquivo
    });

  } catch (uploadErr: any) {
    console.error('Erro geral no processo de upload na API:', uploadErr); // Log do erro completo
    return res.status(500).json({
      message: 'Erro interno do servidor ao processar o upload do arquivo.',
      error: uploadErr.message || 'Erro desconhecido durante o upload.',
    });
  } finally {
    console.log('--- Fim da API de upload ---');
  }
}
