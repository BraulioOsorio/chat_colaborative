-- CreateTable
CREATE TABLE `permissions` (
    `id_permission` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status_permission` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_permission`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id_user` VARCHAR(191) NOT NULL,
    `network_user` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `photo_url` VARCHAR(191) NULL,
    `dominio` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `status_user` BOOLEAN NOT NULL DEFAULT true,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `users_network_user_key`(`network_user`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_permissions` (
    `id_user_permission` INTEGER NOT NULL AUTO_INCREMENT,
    `permission_id` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_user_permission`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channels` (
    `id_channel` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status_channel` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_channel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id_message` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `channel_id` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `url_file` VARCHAR(191) NULL,
    `type_message` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history_maintenances` (
    `id_history_maintenance` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `date_maintenance` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_history_maintenance`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `direct_message` (
    `id_direct_message` INTEGER NOT NULL AUTO_INCREMENT,
    `send_id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `url_file` VARCHAR(191) NULL,
    `message_type` VARCHAR(191) NOT NULL DEFAULT 'message',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_direct_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_channels` (
    `id_user_channel` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `channel_id` INTEGER NOT NULL,

    PRIMARY KEY (`id_user_channel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens` (
    `id_token` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status_token` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id_permission`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id_channel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_maintenances` ADD CONSTRAINT `history_maintenances_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `direct_message` ADD CONSTRAINT `direct_message_send_id_fkey` FOREIGN KEY (`send_id`) REFERENCES `users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `direct_message` ADD CONSTRAINT `direct_message_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_channels` ADD CONSTRAINT `users_channels_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_channels` ADD CONSTRAINT `users_channels_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id_channel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
