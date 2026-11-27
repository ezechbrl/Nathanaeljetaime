import { json, route } from "@/lib/server/http";
import { requireOwner } from "@/lib/server/owner";
import { fillQuizPhotos, quizPhotoJobs, quizPhotoMap } from "@/lib/server/quiz-photos";

export const maxDuration = 120;

// Démo (compte d'Ezechiel) : crée tout de suite une série de photos manquantes du quiz.
export const POST = route(async () => {
  await requireOwner();
  const made = await fillQuizPhotos(12);
  const have = Object.keys(await quizPhotoMap()).length;
  return json({ made, have, total: quizPhotoJobs().length });
});
