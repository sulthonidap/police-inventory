-- AlterTable
ALTER TABLE `reports` ADD COLUMN `poldaId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `reports_poldaId_fkey` ON `reports`(`poldaId`);

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_poldaId_fkey` FOREIGN KEY (`poldaId`) REFERENCES `polda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
