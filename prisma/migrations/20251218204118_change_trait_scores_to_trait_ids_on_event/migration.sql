/*
  Warnings:

  - You are about to drop the column `traitScores` on the `EventProfileSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."EventProfileSnapshot" DROP COLUMN "traitScores",
ADD COLUMN     "traitIds" TEXT[];
