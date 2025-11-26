-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Block_page_idx" ON "Block"("page");

-- CreateIndex
CREATE INDEX "Block_parentId_idx" ON "Block"("parentId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
