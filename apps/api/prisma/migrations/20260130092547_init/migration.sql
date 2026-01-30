-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "oldPost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "thumbnailId" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "iconId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

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
    "ageRange" TEXT,
    "icon" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentTrainingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentTrainingSession" (
    "id" SERIAL NOT NULL,
    "trainingGroupId" INTEGER NOT NULL,
    "locationId" INTEGER,
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
    "mapsUrl" TEXT,
    "amenities" JSONB NOT NULL,
    "imageId" INTEGER,
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
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "address" TEXT,
    "memberCount" INTEGER,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isFullDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "recurrence" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT NOT NULL,
    "profileImageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "thumbnails" JSONB,
    "folderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFolder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroHeadline" TEXT NOT NULL,
    "heroSubHeadline" TEXT NOT NULL,
    "foundingHeadline" TEXT NOT NULL,
    "foundingDescription" TEXT NOT NULL,
    "foundingFactCardHeadline" TEXT NOT NULL,
    "foundingDate" TIMESTAMP(3),
    "foundingMilestonesHeadline" TEXT NOT NULL,
    "developmentHeadline" TEXT NOT NULL,
    "developmentDescription" TEXT NOT NULL,
    "festivalsHeadline" TEXT NOT NULL,
    "festivalsDescription" TEXT NOT NULL,
    "achievementsHeadline" TEXT NOT NULL,
    "ctaHeadline" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryFact" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryMilestone" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroHeadline" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroTag" TEXT NOT NULL,
    "heroLogoId" INTEGER,
    "departmentsHeadline" TEXT NOT NULL,
    "departmentsDescription" TEXT NOT NULL,
    "departmentsSubtitle" TEXT NOT NULL,
    "postsHeadline" TEXT NOT NULL,
    "postsDescription" TEXT NOT NULL,
    "postsSubtitle" TEXT NOT NULL,
    "postsCount" INTEGER NOT NULL DEFAULT 5,
    "ctaHeadline" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageStat" (
    "id" SERIAL NOT NULL,
    "homepageContentId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryChartLabel" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryChartLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryChartDataset" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryChartDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryChartValue" (
    "id" SERIAL NOT NULL,
    "datasetId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryChartValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryChronicleGroup" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "headline" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryChronicleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryChronicleEntry" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryChronicleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryFestivalItem" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "headline" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryFestivalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryAchievement" (
    "id" SERIAL NOT NULL,
    "historyContentId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HistoryAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sectionHeadline" TEXT NOT NULL,
    "sectionDescription" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardMember" (
    "id" SERIAL NOT NULL,
    "boardContentId" INTEGER NOT NULL,
    "contactPersonId" INTEGER NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_parentId_key" ON "Category"("slug", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");

-- CreateIndex
CREATE INDEX "Department_slug_idx" ON "Department"("slug");

-- CreateIndex
CREATE INDEX "DepartmentStat_departmentId_idx" ON "DepartmentStat"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainingGroup_departmentId_idx" ON "DepartmentTrainingGroup"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainingSession_trainingGroupId_idx" ON "DepartmentTrainingSession"("trainingGroupId");

-- CreateIndex
CREATE INDEX "DepartmentTrainingSession_locationId_idx" ON "DepartmentTrainingSession"("locationId");

-- CreateIndex
CREATE INDEX "DepartmentLocation_departmentId_idx" ON "DepartmentLocation"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainer_departmentId_idx" ON "DepartmentTrainer"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentTrainer_contactPersonId_idx" ON "DepartmentTrainer"("contactPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentTrainer_departmentId_contactPersonId_key" ON "DepartmentTrainer"("departmentId", "contactPersonId");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_endDate_idx" ON "Event"("endDate");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Media_filename_key" ON "Media"("filename");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_folderId_idx" ON "Media"("folderId");

-- CreateIndex
CREATE INDEX "MediaFolder_parentId_idx" ON "MediaFolder"("parentId");

-- CreateIndex
CREATE INDEX "HistoryFact_historyContentId_idx" ON "HistoryFact"("historyContentId");

-- CreateIndex
CREATE INDEX "HistoryMilestone_historyContentId_idx" ON "HistoryMilestone"("historyContentId");

-- CreateIndex
CREATE INDEX "HomepageStat_homepageContentId_idx" ON "HomepageStat"("homepageContentId");

-- CreateIndex
CREATE INDEX "HistoryChartLabel_historyContentId_idx" ON "HistoryChartLabel"("historyContentId");

-- CreateIndex
CREATE INDEX "HistoryChartDataset_historyContentId_idx" ON "HistoryChartDataset"("historyContentId");

-- CreateIndex
CREATE INDEX "HistoryChartValue_datasetId_idx" ON "HistoryChartValue"("datasetId");

-- CreateIndex
CREATE INDEX "HistoryChronicleGroup_historyContentId_idx" ON "HistoryChronicleGroup"("historyContentId");

-- CreateIndex
CREATE INDEX "HistoryChronicleEntry_groupId_idx" ON "HistoryChronicleEntry"("groupId");

-- CreateIndex
CREATE INDEX "HistoryFestivalItem_historyContentId_idx" ON "HistoryFestivalItem"("historyContentId");

-- CreateIndex
CREATE INDEX "HistoryAchievement_historyContentId_idx" ON "HistoryAchievement"("historyContentId");

-- CreateIndex
CREATE INDEX "BoardMember_boardContentId_idx" ON "BoardMember"("boardContentId");

-- CreateIndex
CREATE INDEX "BoardMember_contactPersonId_idx" ON "BoardMember"("contactPersonId");

-- CreateIndex
CREATE INDEX "_CategoryToPost_B_index" ON "_CategoryToPost"("B");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentStat" ADD CONSTRAINT "DepartmentStat_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainingGroup" ADD CONSTRAINT "DepartmentTrainingGroup_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainingSession" ADD CONSTRAINT "DepartmentTrainingSession_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "DepartmentTrainingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainingSession" ADD CONSTRAINT "DepartmentTrainingSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DepartmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentLocation" ADD CONSTRAINT "DepartmentLocation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentLocation" ADD CONSTRAINT "DepartmentLocation_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainer" ADD CONSTRAINT "DepartmentTrainer_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentTrainer" ADD CONSTRAINT "DepartmentTrainer_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MediaFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryFact" ADD CONSTRAINT "HistoryFact_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryMilestone" ADD CONSTRAINT "HistoryMilestone_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageContent" ADD CONSTRAINT "HomepageContent_heroLogoId_fkey" FOREIGN KEY ("heroLogoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageStat" ADD CONSTRAINT "HomepageStat_homepageContentId_fkey" FOREIGN KEY ("homepageContentId") REFERENCES "HomepageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryChartLabel" ADD CONSTRAINT "HistoryChartLabel_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryChartDataset" ADD CONSTRAINT "HistoryChartDataset_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryChartValue" ADD CONSTRAINT "HistoryChartValue_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "HistoryChartDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryChronicleGroup" ADD CONSTRAINT "HistoryChronicleGroup_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryChronicleEntry" ADD CONSTRAINT "HistoryChronicleEntry_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HistoryChronicleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryFestivalItem" ADD CONSTRAINT "HistoryFestivalItem_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryAchievement" ADD CONSTRAINT "HistoryAchievement_historyContentId_fkey" FOREIGN KEY ("historyContentId") REFERENCES "HistoryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_boardContentId_fkey" FOREIGN KEY ("boardContentId") REFERENCES "BoardContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
