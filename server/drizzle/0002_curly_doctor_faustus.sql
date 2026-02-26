CREATE TABLE "friendships" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id_1" text NOT NULL,
	"user_id_2" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requester_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_pair" UNIQUE("user_id_1","user_id_2"),
	CONSTRAINT "force_order" CHECK ("friendships"."user_id_1" < "friendships"."user_id_2"),
	CONSTRAINT "requester_is_participant" CHECK ("friendships"."requester_id" = "friendships"."user_id_1" OR "friendships"."requester_id" = "friendships"."user_id_2")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "debts" RENAME COLUMN "lender" TO "lender_name";--> statement-breakpoint
ALTER TABLE "debts" RENAME COLUMN "lendee" TO "lendee_name";--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "lender_id" text;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "lendee_id" text;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "currency" text DEFAULT 'AUD' NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_1_users_id_fk" FOREIGN KEY ("user_id_1") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_2_users_id_fk" FOREIGN KEY ("user_id_2") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_lendee_id_users_id_fk" FOREIGN KEY ("lendee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "one-participant-check" CHECK ("debts"."lender_id" IS NOT NULL OR "debts"."lendee_id" IS NOT NULL);