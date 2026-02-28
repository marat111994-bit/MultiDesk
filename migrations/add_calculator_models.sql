-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "heroImage" TEXT,
    "heroImageAlt" TEXT,
    "topBadge" TEXT,
    "badges" TEXT NOT NULL,
    "trustNumbers" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoH1" TEXT,
    "seoKeywords" TEXT,
    "ogImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "heroImage" TEXT,
    "heroImageAlt" TEXT,
    "topBadge" TEXT,
    "badges" TEXT NOT NULL,
    "trustNumbers" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoH1" TEXT,
    "seoKeywords" TEXT,
    "ogImage" TEXT,
    "serviceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subcategory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FkkoRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hazardClass" INTEGER NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "subcategoryId" TEXT NOT NULL,
    CONSTRAINT "FkkoRow_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "serviceId" TEXT,
    "subcategoryId" TEXT,
    CONSTRAINT "PriceRow_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceRow_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "serviceId" TEXT,
    "subcategoryId" TEXT,
    "pageKey" TEXT,
    CONSTRAINT "FaqItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FaqItem_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Advantage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "serviceId" TEXT,
    "subcategoryId" TEXT,
    "pageKey" TEXT,
    CONSTRAINT "Advantage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Advantage_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverImageAlt" TEXT,
    "author" TEXT NOT NULL DEFAULT 'DanMax',
    "readingTime" INTEGER,
    "tags" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "imageAlt" TEXT,
    "volume" TEXT,
    "duration" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "serviceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Case_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "HomePage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroImage" TEXT,
    "heroImageAlt" TEXT,
    "heroBadges" TEXT NOT NULL,
    "whyUsImage" TEXT,
    "whyUsImageAlt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "serviceType" TEXT,
    "comment" TEXT,
    "source" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediumUrl" TEXT,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CargoCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CargoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemCode" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "fkkoCode" TEXT,
    "hazardClass" INTEGER,
    CONSTRAINT "CargoItem_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "CargoCategory" ("categoryCode") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportTariff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "distanceKm" INTEGER NOT NULL,
    "baseTariffT" REAL NOT NULL,
    "baseTariffTkm" REAL NOT NULL,
    "baseTariffM3" REAL NOT NULL,
    "baseTariffM3km" REAL NOT NULL,
    "outgoingTariffT" REAL NOT NULL,
    "outgoingTariffTkm" REAL NOT NULL,
    "outgoingTariffM3" REAL NOT NULL,
    "outgoingTariffM3km" REAL NOT NULL,
    "marginT" REAL NOT NULL,
    "marginTkm" REAL NOT NULL,
    "marginM3" REAL NOT NULL,
    "marginM3km" REAL NOT NULL,
    "volumeCoeff" REAL NOT NULL DEFAULT 1.4,
    "marginPercent" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TransportTariffConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startKm" REAL NOT NULL,
    "startTariff" REAL NOT NULL,
    "endKm" REAL NOT NULL,
    "endTariff" REAL NOT NULL,
    "point1Km" REAL NOT NULL,
    "point1Tariff" REAL NOT NULL,
    "point2Km" REAL NOT NULL,
    "point2Tariff" REAL NOT NULL,
    "point3Km" REAL NOT NULL,
    "point3Tariff" REAL NOT NULL,
    "paramA" REAL,
    "paramB" REAL,
    "paramC" REAL,
    "hyperMinKm" INTEGER,
    "hyperMaxKm" INTEGER,
    "volumeCoeff" REAL NOT NULL DEFAULT 1.4,
    "marginPercent" REAL NOT NULL DEFAULT 0,
    "maxDistanceKm" INTEGER NOT NULL DEFAULT 500,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Polygon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "polygonId" TEXT NOT NULL,
    "seqNo" INTEGER,
    "receiverName" TEXT NOT NULL,
    "receiverInn" TEXT,
    "facilityAddress" TEXT NOT NULL,
    "facilityCoordinates" TEXT,
    "region" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "kipNumber" TEXT,
    "fkkoCodes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UtilizationTariff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fkkoCode" TEXT NOT NULL,
    "polygonId" TEXT NOT NULL,
    "tariffRubT" REAL NOT NULL,
    CONSTRAINT "UtilizationTariff_polygonId_fkey" FOREIGN KEY ("polygonId") REFERENCES "Polygon" ("polygonId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calculationId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "companyName" TEXT,
    "companyInn" TEXT,
    "companyKpp" TEXT,
    "companyAddress" TEXT,
    "cargoName" TEXT,
    "cargoCode" TEXT,
    "fkkoCode" TEXT,
    "volume" REAL,
    "unit" TEXT,
    "compaction" REAL,
    "pickupAddress" TEXT,
    "pickupCoords" TEXT,
    "pickupMode" TEXT,
    "dropoffAddress" TEXT,
    "dropoffCoords" TEXT,
    "dropoffMode" TEXT,
    "polygonId" TEXT,
    "polygonName" TEXT,
    "polygonAddress" TEXT,
    "polygonCoords" TEXT,
    "distanceKm" REAL,
    "transportTariff" REAL,
    "transportTariffPerKm" REAL,
    "transportPrice" REAL,
    "utilizationTariff" REAL,
    "utilizationPrice" REAL,
    "totalPrice" REAL,
    "comment" TEXT,
    "calculationData" TEXT,
    "pdfData" TEXT,
    "pdfPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Calculation_polygonId_fkey" FOREIGN KEY ("polygonId") REFERENCES "Polygon" ("polygonId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalculationComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calculationId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "authorName" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalculationComment_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "Calculation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CargoCategory_categoryCode_key" ON "CargoCategory"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "CargoItem_itemCode_key" ON "CargoItem"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "TransportTariff_distanceKm_key" ON "TransportTariff"("distanceKm");

-- CreateIndex
CREATE UNIQUE INDEX "Polygon_polygonId_key" ON "Polygon"("polygonId");

-- CreateIndex
CREATE INDEX "UtilizationTariff_fkkoCode_polygonId_idx" ON "UtilizationTariff"("fkkoCode", "polygonId");

-- CreateIndex
CREATE UNIQUE INDEX "UtilizationTariff_fkkoCode_polygonId_key" ON "UtilizationTariff"("fkkoCode", "polygonId");

-- CreateIndex
CREATE UNIQUE INDEX "Calculation_calculationId_key" ON "Calculation"("calculationId");
