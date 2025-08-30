const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

// Função auxiliar para converter strings de timestamp em objetos Date
function parseTimestamps(data) {
  if (!Array.isArray(data)) {
    return data;
  }

  return data.map(item => {
    // Para cada campo de data e hora, converte de string para objeto Date
    if (item.createdAt) {
      item.createdAt = new Date(item.createdAt);
    }
    if (item.updatedAt) {
      item.updatedAt = new Date(item.updatedAt);
    }
    if (item.deletedAt) {
      item.deletedAt = new Date(item.deletedAt);
    }
    return item;
  });
}

async function main() {
  try {
    console.log('Iniciando a restauração...');
    
    const backupPath = path.join(__dirname, 'db_backup.json');
    const backupFile = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(backupFile);

    // Ordem de restauração para respeitar as dependências de chaves estrangeiras
    // Deletar as tabelas dependentes primeiro
    await prisma.colecaoItem.deleteMany({});
    await prisma.colecao.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.testimonial.deleteMany({});
    await prisma.fAQ.deleteMany({});
    await prisma.homepageSection.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.user.deleteMany({});

    // Restaura os dados
    if (backupData.users && backupData.users.length > 0) {
      // Remove campos dependentes para inserção em massa
      const usersToInsert = backupData.users.map(({ sessions, accounts, ...rest }) => ({ ...rest }));
      const parsedUsers = parseTimestamps(usersToInsert);
      await prisma.user.createMany({ data: parsedUsers });
      console.log('Dados da tabela User restaurados.');
    }

    if (backupData.banners && backupData.banners.length > 0) {
      const parsedBanners = parseTimestamps(backupData.banners);
      await prisma.banner.createMany({ data: parsedBanners });
      console.log('Dados da tabela Banner restaurados.');
    }
    
    if (backupData.menus && backupData.menus.length > 0) {
      const parsedMenus = parseTimestamps(backupData.menus);
      await prisma.menu.createMany({ data: parsedMenus });
      console.log('Dados da tabela Menu restaurados.');
    }

    if (backupData.testimonials && backupData.testimonials.length > 0) {
      const parsedTestimonials = parseTimestamps(backupData.testimonials);
      await prisma.testimonial.createMany({ data: parsedTestimonials });
      console.log('Dados da tabela Testimonial restaurados.');
    }

    if (backupData.faqs && backupData.faqs.length > 0) {
      const parsedFaqs = parseTimestamps(backupData.faqs);
      await prisma.fAQ.createMany({ data: parsedFaqs });
      console.log('Dados da tabela FAQ restaurados.');
    }

    if (backupData.homepageSections && backupData.homepageSections.length > 0) {
      const parsedSections = parseTimestamps(backupData.homepageSections);
      await prisma.homepageSection.createMany({ data: parsedSections });
      console.log('Dados da tabela HomepageSection restaurados.');
    }
    
    if (backupData.colecoes && backupData.colecoes.length > 0) {
      // Remove os itens para inserir a coleção primeiro
      const colecoesToInsert = backupData.colecoes.map(({ items, ...rest }) => ({ ...rest }));
      const parsedColecoes = parseTimestamps(colecoesToInsert);
      await prisma.colecao.createMany({ data: parsedColecoes });
      console.log('Dados da tabela Colecao restaurados.');
    }

    if (backupData.colecoes && backupData.colecoes.length > 0) {
      // Agora insere os ColecaoItem
      const todosColecaoItems = backupData.colecoes.flatMap(c => c.items);
      if (todosColecaoItems.length > 0) {
        const parsedColecaoItems = parseTimestamps(todosColecaoItems);
        await prisma.colecaoItem.createMany({ data: parsedColecaoItems });
        console.log('Dados da tabela ColecaoItem restaurados.');
      }
    }

    console.log('Restauração concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao realizar a restauração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();