CREATE TABLE "debts" (
	"id" serial PRIMARY KEY NOT NULL,
	"lender" text NOT NULL,
	"lendee" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'PENDING'
);
