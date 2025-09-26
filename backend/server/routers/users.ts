import { publicProcedure, router } from "../trpc";

export const usersRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
