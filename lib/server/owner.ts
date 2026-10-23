import "server-only";
import { requireUser } from "./auth";
import { HttpError } from "./http";

// Le fondateur de Vigenia : le compte dont l'e-mail est OWNER_EMAIL (variable Vercel).
export const isOwnerEmail = (email: string) => {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(owner) && email.toLowerCase() === owner;
};

export async function requireOwner() {
  const user = await requireUser();
  if (!isOwnerEmail(user.email)) throw new HttpError(403, "forbidden", "Réservé au fondateur de Vigenia.");
  return user;
}
