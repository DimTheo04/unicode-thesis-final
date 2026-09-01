/*
  Warnings:

  - You are about to drop the column `link` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `action_data` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "link",
ADD COLUMN     "action_data" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
