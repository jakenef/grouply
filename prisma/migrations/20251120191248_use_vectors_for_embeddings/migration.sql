/*
  Warnings:

  - You are about to alter the column `embedding` on the `Activity` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(1536)")`.

*/
-- 1) make sure pgvector exists (safe to run repeatedly)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) replace the old JSONB column with a true vector column
ALTER TABLE "public"."Activity" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "public"."Activity" ADD COLUMN "embedding" vector(1536);
