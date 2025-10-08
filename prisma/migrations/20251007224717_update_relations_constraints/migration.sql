/*
  Warnings:

  - You are about to drop the column `createdAt` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `drivers` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `drivers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."drivers" DROP CONSTRAINT "drivers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."expenses" DROP CONSTRAINT "expenses_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vehicles" DROP CONSTRAINT "vehicles_user_id_fkey";

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
