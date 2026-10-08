CREATE INDEX "contracts_user_id_created_at_idx" ON "contracts"("user_id", "created_at" DESC);
CREATE INDEX "contracts_user_id_status_created_at_idx" ON "contracts"("user_id", "status", "created_at" DESC);
