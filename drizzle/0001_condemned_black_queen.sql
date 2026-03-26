ALTER TABLE "links" DROP CONSTRAINT "links_short_code_unique";--> statement-breakpoint
ALTER TABLE "links" ADD PRIMARY KEY ("short_code");--> statement-breakpoint
ALTER TABLE "links" DROP COLUMN "id";