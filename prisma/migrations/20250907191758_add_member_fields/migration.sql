-- AlterTable
ALTER TABLE `users` ADD COLUMN `isEtleOperator` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `jabatan` VARCHAR(191) NULL,
    ADD COLUMN `pangkat` VARCHAR(191) NULL;
