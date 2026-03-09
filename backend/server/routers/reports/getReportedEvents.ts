import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";

export const getReportedEvents = protectedProcedure.query(async ({ ctx }) => {
  // Check if user is admin
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can access reports",
    });
  }

  const reports = await ctx.prisma.report.findMany({
    where: {
      isResolved: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      reporter: {
        select: {
          id: true,
          givenName: true,
          familyName: true,
        },
      },
      event: {
        include: {
          location: true,
          _count: {
            select: { registrations: true },
          },
        },
      },
    },
  });

  // Grouping by event for easier display on frontend
  const reportsByEvent = reports.reduce((acc: any, report) => {
    const eventId = report.eventId;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: {
          id: report.event.id,
          name: report.event.name,
          startsAt: report.event.startsAt,
          formattedLocation: report.event.location.formatted,
          coverImageUrl: report.event.coverImageUrl,
          numCurrentParticipants: report.event._count.registrations,
          maxAttendees: report.event.maxAttendees,
          organizerId: report.event.organizerId,
        },
        reports: [],
      };
    }
    acc[eventId].reports.push({
      id: report.id,
      reason: report.reason,
      description: report.description,
      reporterId: report.reporterUserId,
      reporterName: `${report.reporter.givenName} ${report.reporter.familyName ?? ""}`.trim(),
      createdAt: report.createdAt,
    });
    return acc;
  }, {});

  return Object.values(reportsByEvent) as Array<{
    event: {
      id: string;
      name: string;
      startsAt: Date;
      formattedLocation: string | null;
      coverImageUrl: string;
      numCurrentParticipants: number;
      maxAttendees: number;
      organizerId: string | null;
    };
    reports: Array<{
      id: string;
      reason: string;
      description: string | null;
      reporterId: string;
      reporterName: string;
      createdAt: Date;
    }>;
  }>;
});
