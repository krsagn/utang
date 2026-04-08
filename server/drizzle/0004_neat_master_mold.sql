-- NOTE: These text→uuid casts assume the tables were empty at the time this migration ran.
-- If rows existed, each statement would require an explicit USING clause (e.g. USING id::uuid).
ALTER TABLE "debts" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "lender_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "lendee_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "user_id_1" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "user_id_2" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "requester_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");