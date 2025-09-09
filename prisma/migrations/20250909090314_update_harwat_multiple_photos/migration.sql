/*
  Warnings:

  - You are about to drop the column `photo` on the `harwat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `harwat` DROP COLUMN `photo`,
    ADD COLUMN `photos` TEXT NULL;
