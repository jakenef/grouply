/*
  Warnings:

  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - Made the column `maxAttendees` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minAttendees` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `givenName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `locationId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_locationId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "maxAttendees" SET NOT NULL,
ALTER COLUMN "minAttendees" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "displayName",
ADD COLUMN     "familyName" TEXT,
ADD COLUMN     "givenName" TEXT NOT NULL,
ALTER COLUMN "locationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
