-- CreateTable
CREATE TABLE "type_mst" (
    "id" SERIAL NOT NULL,
    "type_name" VARCHAR(255) NOT NULL,
    "delete_flg" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "type_mst_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_data" (
    "id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "data_name" VARCHAR(255) NOT NULL,
    "current_num" INTEGER NOT NULL,
    "delete_flg" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_history" (
    "id" SERIAL NOT NULL,
    "management_id" INTEGER NOT NULL,
    "change_num" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "comment" TEXT,
    "delete_flg" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "type_mst_delete_flg_idx" ON "type_mst"("delete_flg");

-- CreateIndex
CREATE INDEX "management_data_type_id_idx" ON "management_data"("type_id");

-- CreateIndex
CREATE INDEX "management_data_delete_flg_idx" ON "management_data"("delete_flg");

-- CreateIndex
CREATE INDEX "data_history_management_id_idx" ON "data_history"("management_id");

-- CreateIndex
CREATE INDEX "data_history_delete_flg_idx" ON "data_history"("delete_flg");

-- AddForeignKey
ALTER TABLE "management_data" ADD CONSTRAINT "management_data_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "type_mst"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_history" ADD CONSTRAINT "data_history_management_id_fkey" FOREIGN KEY ("management_id") REFERENCES "management_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
