-- CreateTable
CREATE TABLE "jobs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "company" TEXT,
    "location" TEXT,
    "modality" TEXT,
    "level" TEXT NOT NULL DEFAULT 'Not specified',
    "technologies" TEXT,
    "source" TEXT,
    "link" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "collection_states" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "queryKey" TEXT NOT NULL,
    "lastRun" DATETIME NOT NULL,
    "lastPublicationFound" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_link_key" ON "jobs"("link");

-- CreateIndex
CREATE UNIQUE INDEX "collection_states_source_queryKey_key" ON "collection_states"("source", "queryKey");
