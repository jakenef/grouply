-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "organizerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
