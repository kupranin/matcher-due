import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";
import { getSessionTokenFromRequest } from "@/lib/session";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        vacancy: { include: { company: true } },
        candidateProfile: true,
        chatMessages: true,
      },
    });
    if (!match) {
      return NextResponse.json(
        { matchRow: null, chatMessageCount: 0, employerCanAccess: false, candidateCanAccess: false },
        { status: 404 }
      );
    }

    const chatMessageCount = await prisma.chatMessage.count({ where: { matchId: id } });

    // Employer access: does session employer own this vacancy's company?
    let employerCanAccess = false;
    try {
      const ctx = await getEmployerCompanyFromSession(_request);
      employerCanAccess = !!ctx && match.vacancy?.companyId === ctx.companyId;
    } catch {
      employerCanAccess = false;
    }

    // Candidate access: is current candidate the owner of this profile?
    let candidateCanAccess = false;
    try {
      const token = getSessionTokenFromRequest(new Request("http://localhost", {}));
      if (token) {
        const session = await prisma.session.findUnique({
          where: { token },
          include: { user: { select: { id: true, role: true } } },
        });
        if (session && session.user.role === "CANDIDATE") {
          const profile = await prisma.candidateProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          });
          candidateCanAccess = !!profile && profile.id === match.candidateProfileId;
        }
      }
    } catch {
      candidateCanAccess = false;
    }

    return NextResponse.json({
      matchRow: {
        id: match.id,
        vacancyId: match.vacancyId,
        candidateProfileId: match.candidateProfileId,
        employerLiked: match.employerLiked,
        candidateLiked: match.candidateLiked,
        matchedAt: match.matchedAt,
        createdAt: match.createdAt,
      },
      chatMessageCount,
      employerCanAccess,
      candidateCanAccess,
    });
  } catch (e) {
    return NextResponse.json(
      { matchRow: null, chatMessageCount: 0, employerCanAccess: false, candidateCanAccess: false, error: String(e) },
      { status: 500 }
    );
  }
}

