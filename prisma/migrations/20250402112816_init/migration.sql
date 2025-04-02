/*
  Warnings:

  - Made the column `endTerm` on table `Result` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Result` MODIFY `endTerm` INTEGER NOT NULL;
