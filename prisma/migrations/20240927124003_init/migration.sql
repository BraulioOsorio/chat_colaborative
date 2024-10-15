-- CreateTable
CREATE TABLE "permissions" (
    "id_permission" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status_permission" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id_permission")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_role" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" TEXT NOT NULL,
    "network_user" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "photo_url" TEXT,
    "dominio" TEXT,
    "password" TEXT NOT NULL,
    "status_user" BOOLEAN NOT NULL DEFAULT true,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id_user_permission" SERIAL NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id_user_permission")
);

-- CreateTable
CREATE TABLE "channels" (
    "id_channel" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_channel" TEXT,
    "status_channel" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id_channel")
);

-- CreateTable
CREATE TABLE "messages" (
    "id_message" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "url_file" TEXT,
    "type_message" TEXT NOT NULL DEFAULT 'message',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "history_maintenances" (
    "id_history_maintenance" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date_maintenance" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,

    CONSTRAINT "history_maintenances_pkey" PRIMARY KEY ("id_history_maintenance")
);

-- CreateTable
CREATE TABLE "direct_message" (
    "id_direct_message" SERIAL NOT NULL,
    "send_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url_file" TEXT,
    "type_message" TEXT NOT NULL DEFAULT 'message',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id_direct_message")
);

-- CreateTable
CREATE TABLE "users_channels" (
    "id_user_channel" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" INTEGER NOT NULL,

    CONSTRAINT "users_channels_pkey" PRIMARY KEY ("id_user_channel")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id_token" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status_token" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id_token")
);

-- CreateTable
CREATE TABLE "vulgar_words" (
    "id_vulgar_words" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vulgar_words_pkey" PRIMARY KEY ("id_vulgar_words")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_network_user_key" ON "users"("network_user");

-- CreateIndex
CREATE UNIQUE INDEX "vulgar_words_word_key" ON "vulgar_words"("word");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id_permission") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id_channel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_maintenances" ADD CONSTRAINT "history_maintenances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_send_id_fkey" FOREIGN KEY ("send_id") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_channels" ADD CONSTRAINT "users_channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_channels" ADD CONSTRAINT "users_channels_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id_channel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
