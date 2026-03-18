import { getSuggestedEventsFromUser as getSuggestedEventsService } from "../../services/event/getSuggestedEventsFromUser/getSuggestedEventsFromUser";
import { paidProcedure } from "../../trpc";

export const getSuggestedEventsFromUser = paidProcedure.query(
  async ({ ctx }) => {
    const events = await getSuggestedEventsService(ctx.user.id);

    return events;
  },
);
