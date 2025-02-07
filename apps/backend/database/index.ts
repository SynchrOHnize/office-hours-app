import postgres from 'postgres';
import sql from '@/database';

async function execute(filename: string) {
  console.log(`Executing ${filename}`);
  try {
    await sql.file(filename);
  } catch (e) {
    if (!(e instanceof postgres.PostgresError && (
          e.code === '42710' // duplicate_object
       || e.code === '42P07' // duplicate_table
    ))) throw e;
  }
}

async function init() {
  console.log('Initializing database...');
  await sql`CREATE SCHEMA IF NOT EXISTS public`;
  for (const name of [
    'users',
    'courses',
    'office-hours',
    'user-courses',
    'feedback',
  ]) await execute(`database/init/${name}.sql`);
}

async function wipe() {
  console.log('Destroying database...');
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
}

switch (process.argv[2]) {
  case 'init':
    await init();
    break;
  case 'wipe':
    await wipe();
    break;
  case 'reset':
    await wipe();
    await init();
    break;
}

await sql.end();
