-- DropForeignKey
ALTER TABLE "public"."EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SavedEvent" DROP CONSTRAINT "SavedEvent_eventId_fkey";

-- AddForeignKey
ALTER TABLE "public"."EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedEvent" ADD CONSTRAINT "SavedEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
