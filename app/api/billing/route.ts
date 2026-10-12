import { requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { getUsage } from "@/lib/server/quota";
import { billingFor } from "@/lib/server/stripe";

export const GET = route(async () => {
  const user = await requireUser();
  const [{ subscription, invoices }, usage] = await Promise.all([billingFor(user), getUsage(user.id, user.plan)]);
  return json({ subscription, usage, invoices });
});
