CREATE TABLE `tax_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`institution` text NOT NULL,
	`doc_type` text NOT NULL,
	`tax_year` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`portal_url` text,
	`notes` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
