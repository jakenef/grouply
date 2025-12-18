/*
  Warnings:

  - You are about to drop the column `traitIds` on the `EventProfileSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."EventProfileSnapshot" DROP COLUMN "traitIds",
ADD COLUMN     "traitScores" JSONB;
