/*
  Warnings:

  - You are about to drop the `saved_filters` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "savedFilters" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "saved_filters";
PRAGMA foreign_keys=on;
