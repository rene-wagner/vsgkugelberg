-- CreateTable
CREATE TABLE "DepartmentStat" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentTrainingGroup" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "note" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentTrainingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentTrainingSession" (
    "id" SERIAL NOT NULL,
    "trainingGroupId" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentTrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentLocation" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "badgeVariant" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "mapsUrl" TEXT NOT NULL,
    "amenities" JSONB NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentTrainer" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "contactPersonId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "licenses" JSONB NOT NULL,
    "experience" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DepartmentStat_departmentId_idx" ON "DepartmentStat"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainingGroup_departmentId_idx" ON "DepartmentTrainingGroup"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainingSession_trainingGroupId_idx" ON "DepartmentTrainingSession"("trainingGroupId");

-- CreateIndex
CREATE INDEX "DepartmentLocation_departmentId_idx" ON "DepartmentLocation"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainer_departmentId_idx" ON "DepartmentTrainer"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainer_contactPersonId_idx" ON "DepartmentTrainer"("contactPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentTrainer_departmentId_contactPersonId_key" ON "DepartmentTrainer"("departmentId", "contactPersonId");

-- AddForeignKey
ALTER TABLE "DepartmentStat" ADD CONSTRAINT "DepartmentStat_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainingGroup" ADD CONSTRAINT "DepartmentTrainingGroup_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainingSession" ADD CONSTRAINT "DepartmentTrainingSession_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "DepartmentTrainingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentLocation" ADD CONSTRAINT "DepartmentLocation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainer" ADD CONSTRAINT "DepartmentTrainer_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainer" ADD CONSTRAINT "DepartmentTrainer_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
