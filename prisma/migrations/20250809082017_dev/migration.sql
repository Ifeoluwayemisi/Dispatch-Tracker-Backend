-- AlterTable
ALTER TABLE `booking` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetExpires` DATETIME(3) NULL,
    ADD COLUMN `resetToken` VARCHAR(191) NULL DEFAULT '';

-- CreateIndex
CREATE INDEX `Booking_isDeleted_idx` ON `Booking`(`isDeleted`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);
