/*
  Warnings:

  - Added the required column `change_date` to the `data_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "data_history" ADD COLUMN     "change_date" TIMESTAMP(3) NOT NULL;
