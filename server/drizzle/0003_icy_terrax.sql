CREATE INDEX "idx_debts_lender" ON "debts" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "idx_debts_lendee" ON "debts" USING btree ("lendee_id");--> statement-breakpoint
CREATE INDEX "idx_debts_created_by" ON "debts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_friendships_user1" ON "friendships" USING btree ("user_id_1");--> statement-breakpoint
CREATE INDEX "idx_friendships_user2" ON "friendships" USING btree ("user_id_2");--> statement-breakpoint
CREATE INDEX "idx_friendships_requester" ON "friendships" USING btree ("requester_id");