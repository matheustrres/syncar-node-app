CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

CREATE INDEX "vehicles_user_id_status_idx" ON "vehicles"("user_id", "status");

CREATE INDEX "contracts_user_id_idx" ON "contracts"("user_id");

CREATE INDEX "payments_contract_id_status_due_date_idx" ON "payments"("contract_id", "status", "due_date");

CREATE INDEX "expenses_user_id_idx" ON "expenses"("user_id");
