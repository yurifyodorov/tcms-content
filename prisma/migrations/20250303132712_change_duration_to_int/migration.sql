/*
  Warnings:

  - You are about to alter the column `duration` on the `run_features` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `duration` on the `run_scenarios` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `duration` on the `run_steps` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "run_features" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "run_scenarios" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "run_steps" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" SET DATA TYPE INTEGER;
