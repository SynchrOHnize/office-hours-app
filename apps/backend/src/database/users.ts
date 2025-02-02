import sql from "@/database";
import type { User } from "@/schemas/user";

export async function getAllUsers(): Promise<User[]> {
  const rows = await sql`SELECT * FROM users`;
  return rows as unknown[] as User[];
}

export async function storeUser(
  id: string,
  imageUrl: string,
  firstName: string,
  lastName: string,
  email: string,
  role: string,
): Promise<User> {
  const rows = await sql`
    INSERT INTO users (id, img_url, first_name, last_name, email, role)
      VALUES (${id}, ${imageUrl}, ${firstName}, ${lastName}, ${email}, ${role})
      RETURNING *`;
  return rows[0] as User;
}

export async function getById(id: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows.length ? (rows[0] as User) : null;
}
