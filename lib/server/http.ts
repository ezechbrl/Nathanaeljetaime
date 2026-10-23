import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ConfigError } from "./env";

// Erreur métier renvoyée telle quelle au frontend ({ error: { code, message, field } }).
export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public field?: string) {
    super(message);
  }
}

export const badRequest = (message: string, field?: string) => new HttpError(400, "invalid_input", message, field);
export const notFound = () => new HttpError(404, "not_found", "Introuvable.");

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

function errorResponse(e: unknown) {
  if (e instanceof HttpError) {
    return NextResponse.json({ error: { code: e.code, message: e.message, field: e.field } }, { status: e.status });
  }
  if (e instanceof z.ZodError) {
    const issue = e.issues[0];
    return NextResponse.json({ error: { code: "invalid_input", message: issue?.message ?? "Données invalides.", field: issue?.path.join(".") } }, { status: 400 });
  }
  if (e instanceof Anthropic.RateLimitError) {
    return NextResponse.json({ error: { code: "rate_limited", message: "L'IA est très sollicitée, réessaie dans un instant." } }, { status: 429 });
  }
  if (e instanceof Anthropic.APIError) {
    console.error("Anthropic", e.status, e.message);
    return NextResponse.json({ error: { code: "upstream_error", message: "Le service d'IA est momentanément indisponible." } }, { status: 502 });
  }
  if (e instanceof ConfigError) {
    console.error(e.message);
    return NextResponse.json({ error: { code: "not_configured", message: "Ce service n'est pas encore configuré." } }, { status: 503 });
  }
  console.error(e);
  // Erreur de base de données : on montre sa raison (courte) pour pouvoir la corriger.
  const hint = e instanceof Error && e.message.startsWith("Supabase") ? ` (base de données : ${e.message.replace(/^Supabase : /, "").slice(0, 160)})` : "";
  return NextResponse.json({ error: { code: "internal", message: `Une erreur est survenue${hint}. Réessaie ; si ça continue, écris-nous.` } }, { status: 500 });
}

// Erreurs serveur gardées 30 jours pour le tableau de bord du fondateur (jamais bloquant).
async function logError(req: Request, status: number, e: unknown) {
  try {
    const { db } = await import("./supabase");
    await db().from("app_errors").insert({
      path: `${req.method} ${new URL(req.url).pathname}`,
      status,
      code: e instanceof HttpError ? e.code : (e as Error)?.name ?? null,
      message: String((e as Error)?.message ?? e).slice(0, 300),
    });
  } catch {}
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

// Enveloppe une route : convertit toutes les erreurs au format du contrat d'API.
export function route<C = { params: Promise<Record<string, string>> }>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      const res = errorResponse(e);
      if (res.status >= 500) await logError(req, res.status, e);
      return res;
    }
  };
}

export async function body<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  const data = await req.json().catch(() => {
    throw badRequest("Corps de requête JSON invalide.");
  });
  return schema.parse(data);
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
