-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "name_normalized" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "model_normalized" TEXT,
ADD COLUMN     "plate_normalized" TEXT;
