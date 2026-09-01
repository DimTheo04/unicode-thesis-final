-- CreateTable
CREATE TABLE "comment_read_states" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_read_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_read_states_user_id_comment_id_key" ON "comment_read_states"("user_id", "comment_id");

-- AddForeignKey
ALTER TABLE "comment_read_states" ADD CONSTRAINT "comment_read_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_read_states" ADD CONSTRAINT "comment_read_states_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "inline_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
