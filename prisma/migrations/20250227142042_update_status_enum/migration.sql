/*
  Warnings:

  - Changed the type of `status` on the `run_features` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `run_scenarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `run_steps` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('passed', 'failed', 'skipped');

-- AlterTable
ALTER TABLE "run_features" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "run_scenarios" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "run_steps" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- DropEnum
DROP TYPE "StepStatus";
