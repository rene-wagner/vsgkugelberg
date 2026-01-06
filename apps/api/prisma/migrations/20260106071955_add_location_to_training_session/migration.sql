-- AlterTable
ALTER TABLE "DepartmentTrainingSession" ADD COLUMN     "locationId" INTEGER;

-- CreateIndex
CREATE INDEX "DepartmentTrainingSession_locationId_idx" ON "DepartmentTrainingSession"("locationId");

-- AddForeignKey
ALTER TABLE "DepartmentTrainingSession" ADD CONSTRAINT "DepartmentTrainingSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DepartmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
