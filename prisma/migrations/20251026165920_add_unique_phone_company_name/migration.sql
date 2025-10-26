/*
  Warnings:

  - A unique constraint covering the columns `[company_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_company_name_key" ON "users"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
