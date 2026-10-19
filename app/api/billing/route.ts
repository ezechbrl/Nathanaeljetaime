import { requireUser } from "@/lib/server/auth";
import { billingFor } from "@/lib/server/billing";
import { launchOfferEndsAt } from "@/lib/server/stripe";
import { json, route } from "@/lib/server/http";
import { getUsage } from "@/lib/server/quota";

export const GET = route(async () => {
  const user = await requireUser();
  const [{ subscription, invoices }, usage, offerEndsAt] = await Promise.all([billingFor(user), getUsage(user.id, user.plan), launchOfferEndsAt(user)]);
  return json({ subscription, usage, invoices, offerEndsAt });
});
