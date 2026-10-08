CREATE INDEX "payments_status_due_date_idx" ON "payments"("status", "due_date" ASC);
CREATE INDEX "payments_status_payment_date_idx" ON "payments"("status", "payment_date" DESC);
CREATE INDEX "expenses_user_id_date_idx" ON "expenses"("user_id", "date" DESC);
