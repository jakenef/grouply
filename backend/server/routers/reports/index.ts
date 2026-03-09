import { router } from "../../trpc";
import { getReportedEvents } from "./getReportedEvents";
import { reportEvent } from "./reportEvent";
import { resolveReport } from "./resolveReport";

export const reportsRouter = router({
  reportEvent,
  getReportedEvents,
  resolveReport,
});
