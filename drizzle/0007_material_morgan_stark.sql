CREATE TABLE `mortgages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`original_amount` integer NOT NULL,
	`interest_rate` integer NOT NULL,
	`term_months` integer DEFAULT 360 NOT NULL,
	`pi_payment` integer NOT NULL,
	`escrow_payment` integer DEFAULT 0,
	`current_balance` integer,
	`balance_as_of` text,
	`extra_payment` integer DEFAULT 0,
	`sort_order` integer DEFAULT 0,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
