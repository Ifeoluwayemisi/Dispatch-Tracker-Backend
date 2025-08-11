-- AlterTable
ALTER TABLE `booking` ADD COLUMN `codeExpiresAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `DeliveryLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `riderId` INTEGER NOT NULL,
    `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DeliveryLog_bookingId_idx`(`bookingId`),
    INDEX `DeliveryLog_riderId_idx`(`riderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryLog` ADD CONSTRAINT `DeliveryLog_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryLog` ADD CONSTRAINT `DeliveryLog_riderId_fkey` FOREIGN KEY (`riderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
