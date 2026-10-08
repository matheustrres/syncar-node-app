CREATE INDEX "drivers_user_id_created_at_idx" ON "drivers"("user_id", "created_at" DESC);
CREATE INDEX "drivers_user_id_status_idx" ON "drivers"("user_id", "status");
