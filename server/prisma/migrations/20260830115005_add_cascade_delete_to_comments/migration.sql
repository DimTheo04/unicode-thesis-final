-- DropForeignKey
ALTER TABLE "inline_comments" DROP CONSTRAINT "inline_comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "thread_messages" DROP CONSTRAINT "thread_messages_author_id_fkey";

-- AddForeignKey
ALTER TABLE "inline_comments" ADD CONSTRAINT "inline_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_messages" ADD CONSTRAINT "thread_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
