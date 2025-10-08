/*
  Warnings:

  - You are about to drop the column `address` on the `drivers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "address",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "uf" TEXT;
