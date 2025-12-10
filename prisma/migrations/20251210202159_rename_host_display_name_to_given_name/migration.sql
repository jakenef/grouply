/*
  Warnings:

  - You are about to drop the column `hostDisplayName` on the `EventProfileSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."EventProfileSnapshot" DROP COLUMN "hostDisplayName",
ADD COLUMN     "hostGivenName" TEXT;
