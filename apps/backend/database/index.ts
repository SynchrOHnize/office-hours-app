import fs from 'fs';
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

async function executeDir(dirname: string) {
  const names = fs.readdirSync(dirname)
    .filter(name => name.endsWith('.sql'))
    .sort();
  for (const name of names)
    await execute(`${dirname}/${name}`);
}

async function up() {
  await sql`CREATE SCHEMA IF NOT EXISTS public`;
  await executeDir('database/up');
}

async function wipe() {
  console.log('Destroying database...');
  await sql`DROP SCHEMA public CASCADE`;
}

async function seed() {
  await executeDir('database/seed');
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('error: expected 1 argument');
  process.exit(1);
}

switch (args[0]) {
  case 'up':
    await up();
    break;
  case 'wipe':
    await wipe();
    break;
  case 'seed':
    await seed();
    break;
  case 'reset':
    await wipe();
    await up();
    break;
  default:
    console.error(`error: invalid argument '${args[0]}'`);
    process.exit(1);
}

await sql.end();
