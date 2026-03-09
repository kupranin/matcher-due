/**
 * Single source of truth for resolving a like and optionally creating a mutual match.
 * Used by POST /api/matches (employer and candidate). Runs in one transaction.
 */
import { PrismaClient } from "@prisma/client";
import { MATCH_SYSTEM_MESSAGE_TEXT } from "@/lib/matchSystemMessage";

const LOG_PREFIX = "[resolveMatch]";

export type ActorType = "employer" | "candidate";

export type ResolveMatchResult = {
  ok: true;
  matchId: string;
  employerLiked: boolean;
  candidateLiked: boolean;
  isMatch: boolean;
  matchedAt: string | null;
  conversationReady: boolean;
};

function maskHost(): string {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return "none";
  try {
    const u = new URL(url.replace(/^postgres(ql)?:\/\//, "https://"));
    return u.hostname + (u.port ? `:${u.port}` : "");
  } catch {
    return "masked";
  }
}

/**
 * In a single transaction:
 * 1. Upsert match row, set employer_liked or candidate_liked by actor.
 * 2. If both liked and matched_at is null: set matched_at, insert system chat message (once).
 * 3. Return canonical result. No optimistic match — isMatch only when DB confirms both flags.
 */
export async function resolveMatchForPair(
  prisma: PrismaClient,
  params: {
    vacancyId: string;
    candidateProfileId: string;
    actorType: ActorType;
    matchScore: number | null;
    reqId?: string;
  }
): Promise<ResolveMatchResult> {
  const { vacancyId, candidateProfileId, actorType, matchScore, reqId = "" } = params;

  const before = await prisma.match.findUnique({
    where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
    select: { id: true, employerLiked: true, candidateLiked: true, matchedAt: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.match.upsert({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
      update: {
        ...(actorType === "employer" && { employerLiked: true }),
        ...(actorType === "candidate" && { candidateLiked: true }),
        ...(matchScore != null && { matchScore }),
      },
      create: {
        vacancyId,
        candidateProfileId,
        employerLiked: actorType === "employer",
        candidateLiked: actorType === "candidate",
        matchScore: matchScore ?? undefined,
      },
    });

    const row = await tx.match.findUnique({
      where: { id: updated.id },
      select: { id: true, employerLiked: true, candidateLiked: true, matchedAt: true },
    });
    const r = row ?? updated;
    const isMutual = Boolean(r.candidateLiked && r.employerLiked);
    const matchedAtNull = r.matchedAt == null;

    let didSetMatchedAt = false;
    let didInsertSystemMessage = false;

    if (isMutual && matchedAtNull) {
      await tx.match.update({
        where: { id: r.id },
        data: { matchedAt: new Date() },
      });
      didSetMatchedAt = true;

      const existingSystem = await tx.chatMessage.findFirst({
        where: { matchId: r.id, sender: "system" },
        select: { id: true },
      });
      if (!existingSystem) {
        await tx.chatMessage.create({
          data: { matchId: r.id, sender: "system", text: MATCH_SYSTEM_MESSAGE_TEXT },
        });
        didInsertSystemMessage = true;
      }
    }

    const afterRow = await tx.match.findUnique({
      where: { id: r.id },
      select: { id: true, employerLiked: true, candidateLiked: true, matchedAt: true },
    });
    const final = afterRow ?? r;

    console.info(
      JSON.stringify({
        tag: LOG_PREFIX,
        reqId,
        vacancyId,
        candidateProfileId,
        actorType,
        before: before
          ? {
              employerLiked: before.employerLiked,
              candidateLiked: before.candidateLiked,
              matchedAt: before.matchedAt != null,
            }
          : null,
        after: {
          employerLiked: final.employerLiked,
          candidateLiked: final.candidateLiked,
          matchedAt: final.matchedAt != null,
        },
        didSetMatchedAt,
        didInsertSystemMessage,
        matchId: final.id,
        transactionCommitted: true,
        host: maskHost(),
      })
    );

    return {
      matchId: final.id,
      employerLiked: Boolean(final.employerLiked),
      candidateLiked: Boolean(final.candidateLiked),
      isMatch: Boolean(final.candidateLiked && final.employerLiked),
      matchedAt: final.matchedAt != null ? final.matchedAt.toISOString() : null,
      conversationReady: Boolean(final.candidateLiked && final.employerLiked),
    };
  });

  return {
    ok: true,
    ...result,
  };
}
