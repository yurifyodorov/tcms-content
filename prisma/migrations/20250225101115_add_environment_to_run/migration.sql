/*
  Warnings:

  - Added the required column `environment` to the `runs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "runs" ADD COLUMN     "environment" TEXT NOT NULL;
