import z from "zod";
import { protectedProcedure } from "../../trpc";

export const getAvatarUrlsFromIds = protectedProcedure
  .input(
    z.object({
      userIds: z.array(z.string()),
    }),
  )
  .output(
    z.array(
      z.object({
        userId: z.string(),
        avatarUrl: z.string().nullable(),
        firstName: z.string(),
      }),
    ),
  )
  .query(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        id: { in: input.userIds },
      },
    });
    return users.map((user) => ({
      userId: user.id,
      avatarUrl: user.avatarUrl,
      firstName: user.givenName,
    }));
  });
