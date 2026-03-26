CREATE TABLE "links" (
	"short_code" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT current_timestamp NOT NULL,
	"updated_at" timestamp with time zone DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "links_user_id_idx" ON "links" USING btree ("user_id");