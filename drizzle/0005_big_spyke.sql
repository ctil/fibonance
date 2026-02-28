CREATE TABLE `retirement_scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text DEFAULT 'Default' NOT NULL,
	`current_value` integer,
	`annual_savings` integer,
	`annual_expenses` integer,
	`safe_withdrawal_rate` integer,
	`expected_real_return` integer,
	`year_adjustment` integer DEFAULT 5,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
