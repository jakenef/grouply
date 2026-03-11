import { prisma } from "../../prisma";
import { protectedProcedure } from "../../trpc";

export const getStatus = protectedProcedure.query(async ({ ctx }) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: ctx.user.id,
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
    orderBy: {
      currentPeriodEnd: "desc",
    },
    select: {
      id: true,
      productId: true,
      platform: true,
      currentPeriodEnd: true,
      createdAt: true,
    },
  });

  return {
    isActive: !!subscription,
    subscription,
  };
});
