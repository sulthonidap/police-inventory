/*
  Warnings:

  - The values [DIGITAL] on the enum `assets_kind` will be removed. If these variants are still used in the database, this will fail.
  - The values [APBN,KERJASAMA] on the enum `assets_source` will be removed. If these variants are still used in the database, this will fail.
  - The values [DIGITAL] on the enum `assets_kind` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `assets` ADD COLUMN `inactiveReason` VARCHAR(191) NULL,
    ADD COLUMN `inactiveSimakData` VARCHAR(191) NULL,
    ADD COLUMN `inactiveSimakInstitution` VARCHAR(191) NULL,
    ADD COLUMN `loanDocumentFile` VARCHAR(191) NULL,
    ADD COLUMN `loanRegionId` VARCHAR(191) NULL,
    ADD COLUMN `loanRepEmail` VARCHAR(191) NULL,
    ADD COLUMN `loanRepName` VARCHAR(191) NULL,
    ADD COLUMN `loanRepPhone` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceCompanyAddress` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceCompanyDistrict` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceCompanyName` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceCompanyProvince` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceCompanyRegency` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceCompanyVillage` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceRepEmail` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceRepName` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceRepPhone` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceStatus` ENUM('AKTIF', 'NON_AKTIF') NULL,
    ADD COLUMN `maintenanceValidityDate` DATETIME(3) NULL,
    ADD COLUMN `operationalRegionId` VARCHAR(191) NULL,
    ADD COLUMN `registrationDate` DATETIME(3) NULL,
    ADD COLUMN `simakData` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyAddress` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyDistrict` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyName` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyProvince` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyRegency` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyRepEmail` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyRepName` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyRepPhone` VARCHAR(191) NULL,
    ADD COLUMN `sourceCompanyVillage` VARCHAR(191) NULL,
    ADD COLUMN `sourceDetail` VARCHAR(191) NULL,
    ADD COLUMN `sourceRegionId` VARCHAR(191) NULL,
    ADD COLUMN `usageRegionId` VARCHAR(191) NULL,
    MODIFY `kind` ENUM('DIGITAL_IT', 'BARANG', 'JASA') NULL,
    MODIFY `source` ENUM('PENGADAAN', 'HIBAH', 'PINJAM_PAKAI', 'POC', 'LAINNYA') NULL;

-- AlterTable
ALTER TABLE `categories` MODIFY `kind` ENUM('DIGITAL_IT', 'BARANG', 'JASA') NOT NULL;

-- CreateIndex
CREATE INDEX `assets_sourceRegionId_fkey` ON `assets`(`sourceRegionId`);

-- CreateIndex
CREATE INDEX `assets_operationalRegionId_fkey` ON `assets`(`operationalRegionId`);

-- CreateIndex
CREATE INDEX `assets_loanRegionId_fkey` ON `assets`(`loanRegionId`);

-- CreateIndex
CREATE INDEX `assets_usageRegionId_fkey` ON `assets`(`usageRegionId`);

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_sourceRegionId_fkey` FOREIGN KEY (`sourceRegionId`) REFERENCES `polda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_operationalRegionId_fkey` FOREIGN KEY (`operationalRegionId`) REFERENCES `polda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_loanRegionId_fkey` FOREIGN KEY (`loanRegionId`) REFERENCES `polda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_usageRegionId_fkey` FOREIGN KEY (`usageRegionId`) REFERENCES `polda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
