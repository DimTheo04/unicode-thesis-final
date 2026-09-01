/*
  Warnings:

  - Changed the type of `action_data` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "action_data" TYPE JSONB USING "action_data"::jsonb;
