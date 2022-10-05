-- CreateTable
CREATE TABLE "monthly_aggregation" (
    "id" SERIAL NOT NULL,
    "management_id" INTEGER NOT NULL,
    "aggregate_num" INTEGER NOT NULL,
    "aggregate_date" DATE NOT NULL,
    "delete_flg" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_aggregation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monthly_aggregation_management_id_idx" ON "monthly_aggregation"("management_id");

-- CreateIndex
CREATE INDEX "monthly_aggregation_delete_flg_idx" ON "monthly_aggregation"("delete_flg");

-- AddForeignKey
ALTER TABLE "monthly_aggregation" ADD CONSTRAINT "monthly_aggregation_management_id_fkey" FOREIGN KEY ("management_id") REFERENCES "management_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
