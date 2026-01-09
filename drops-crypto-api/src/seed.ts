// Скрипт для заполнения тестовыми данными
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test streamers
  const streamer1 = await prisma.streamer.upsert({
    where: { twitchId: 'streamer1' },
    update: {},
    create: {
      twitchId: 'streamer1',
      twitchLogin: 'streamer1',
      displayName: 'Streamer One',
      isActive: true,
    },
  });

  const streamer2 = await prisma.streamer.upsert({
    where: { twitchId: 'streamer2' },
    update: {},
    create: {
      twitchId: 'streamer2',
      twitchLogin: 'streamer2',
      displayName: 'Streamer Two',
      isActive: true,
    },
  });

  // Create test prizes
  await prisma.prize.upsert({
    where: { id: 'prize1' },
    update: {},
    create: {
      id: 'prize1',
      streamerId: streamer1.id,
      title: '100 токенов',
      description: 'За просмотр стрима',
      tokenAmount: '100',
      chain: 'base',
      isActive: true,
    },
  });

  await prisma.prize.upsert({
    where: { id: 'prize2' },
    update: {},
    create: {
      id: 'prize2',
      streamerId: streamer2.id,
      title: 'Эксклюзивный NFT',
      description: 'Уникальный NFT от стримера',
      chain: 'base',
      isActive: true,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
