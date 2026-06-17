-- ============================================
-- English Learning Platform - Initial Schema
-- Database: en
-- ============================================
-- 使用方法：
--   1. 先在可视化工具中手动创建 en 数据库（如果还没建）
--   2. 在工具左侧切换到 en 库
--   3. 复制下面全部内容到查询窗口执行
-- ============================================

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `passwordHash` VARCHAR(255) NULL,
    `nickname` VARCHAR(100) NOT NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `wechatUnionId` VARCHAR(64) NULL,
    `wechatOpenId` VARCHAR(64) NULL,
    `membershipId` INTEGER NULL,
    `membershipExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    UNIQUE INDEX `User_wechatUnionId_key`(`wechatUnionId`),
    UNIQUE INDEX `User_wechatOpenId_key`(`wechatOpenId`),
    INDEX `User_membershipId_idx`(`membershipId`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(500) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    INDEX `RefreshToken_userId_idx`(`userId`),
    INDEX `RefreshToken_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmsCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SmsCode_phone_code_idx`(`phone`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserUsageQuota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `quotaType` VARCHAR(50) NOT NULL,
    `dailyLimit` INTEGER NOT NULL DEFAULT 5,
    `usedToday` INTEGER NOT NULL DEFAULT 0,
    `lastResetDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserUsageQuota_userId_quotaType_key`(`userId`, `quotaType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Membership` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `priceMonthly` DECIMAL(10, 2) NOT NULL,
    `priceYearly` DECIMAL(10, 2) NOT NULL,
    `features` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Membership_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `membershipId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'CNY',
    `channel` VARCHAR(20) NOT NULL,
    `providerOrderId` VARCHAR(128) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `paymentUrl` TEXT NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_providerOrderId_key`(`providerOrderId`),
    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) NOT NULL,
    `source` VARCHAR(255) NULL,
    `summary` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `difficultyLevel` VARCHAR(20) NOT NULL DEFAULT 'intermediate',
    `wordCount` INTEGER NOT NULL DEFAULT 0,
    `estimatedMinutes` INTEGER NOT NULL DEFAULT 5,
    `coverImage` VARCHAR(500) NULL,
    `publishDate` DATETIME(3) NULL,
    `isMembershipOnly` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Article_slug_key`(`slug`),
    INDEX `Article_difficultyLevel_idx`(`difficultyLevel`),
    INDEX `Article_isMembershipOnly_idx`(`isMembershipOnly`),
    INDEX `Article_isPublished_idx`(`isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleParagraph` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `articleId` INTEGER NOT NULL,
    `paragraphIndex` INTEGER NOT NULL,
    `contentEn` TEXT NOT NULL,
    `contentZh` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ArticleParagraph_articleId_paragraphIndex_idx`(`articleId`, `paragraphIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordAnnotation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(255) NOT NULL,
    `phonetic` VARCHAR(255) NULL,
    `partOfSpeech` VARCHAR(50) NULL,
    `translation` VARCHAR(500) NOT NULL,
    `definitionEn` TEXT NULL,
    `exampleSentence` TEXT NULL,
    `aiAnalysis` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WordAnnotation_word_key`(`word`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserVocabulary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `wordAnnotationId` INTEGER NOT NULL,
    `addedFrom` VARCHAR(50) NULL,
    `masteryLevel` INTEGER NOT NULL DEFAULT 0,
    `nextReviewAt` DATETIME(3) NULL,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `lastReviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserVocabulary_userId_nextReviewAt_idx`(`userId`, `nextReviewAt`),
    INDEX `UserVocabulary_userId_masteryLevel_idx`(`userId`, `masteryLevel`),
    UNIQUE INDEX `UserVocabulary_userId_wordAnnotationId_key`(`userId`, `wordAnnotationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `scrollPercent` INTEGER NOT NULL DEFAULT 0,
    `timeSpentSeconds` INTEGER NOT NULL DEFAULT 0,
    `lastReadAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ArticleProgress_userId_articleId_key`(`userId`, `articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VocabularyBook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(50) NOT NULL,
    `totalWords` INTEGER NOT NULL DEFAULT 0,
    `isMembershipOnly` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VocabularyBook_slug_key`(`slug`),
    INDEX `VocabularyBook_category_idx`(`category`),
    INDEX `VocabularyBook_isMembershipOnly_idx`(`isMembershipOnly`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VocabularyWord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `word` VARCHAR(255) NOT NULL,
    `phonetic` VARCHAR(255) NULL,
    `partOfSpeech` VARCHAR(50) NULL,
    `translation` VARCHAR(500) NOT NULL,
    `definitionEn` TEXT NULL,
    `exampleSentence` TEXT NULL,
    `wordIndex` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VocabularyWord_bookId_wordIndex_idx`(`bookId`, `wordIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VocabularyBookProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,
    `learnedCount` INTEGER NOT NULL DEFAULT 0,
    `reviewingCount` INTEGER NOT NULL DEFAULT 0,
    `masteredCount` INTEGER NOT NULL DEFAULT 0,
    `lastStudiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VocabularyBookProgress_userId_bookId_key`(`userId`, `bookId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VocabularyReviewLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `wordId` INTEGER NOT NULL,
    `quality` INTEGER NOT NULL,
    `reviewDurationMs` INTEGER NOT NULL,
    `reviewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VocabularyReviewLog_userId_wordId_idx`(`userId`, `wordId`),
    INDEX `VocabularyReviewLog_userId_reviewedAt_idx`(`userId`, `reviewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IELTSExam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `isFullExam` BOOLEAN NOT NULL DEFAULT false,
    `difficultyLevel` VARCHAR(20) NOT NULL DEFAULT 'intermediate',
    `totalQuestions` INTEGER NOT NULL DEFAULT 0,
    `totalSections` INTEGER NOT NULL DEFAULT 1,
    `durationMinutes` INTEGER NOT NULL,
    `audioUrl` VARCHAR(500) NULL,
    `isMembershipOnly` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IELTSExam_type_idx`(`type`),
    INDEX `IELTSExam_isPublished_idx`(`isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IELTSExamSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examId` INTEGER NOT NULL,
    `sectionIndex` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `instructions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IELTSExamSection_examId_sectionIndex_idx`(`examId`, `sectionIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IELTSQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionId` INTEGER NOT NULL,
    `questionIndex` INTEGER NOT NULL,
    `questionType` VARCHAR(30) NOT NULL,
    `questionText` TEXT NULL,
    `options` TEXT NULL,
    `correctAnswer` TEXT NOT NULL,
    `score` DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
    `answerExplanation` TEXT NULL,
    `passageText` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IELTSQuestion_sectionId_questionIndex_idx`(`sectionId`, `questionIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IELTSAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `examId` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,
    `totalScore` DECIMAL(5, 2) NULL,
    `maxScore` DECIMAL(5, 2) NOT NULL,
    `timeSpentSeconds` INTEGER NULL,
    `isFreeTrial` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IELTSAttempt_userId_examId_idx`(`userId`, `examId`),
    INDEX `IELTSAttempt_userId_startedAt_idx`(`userId`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IELTSUserAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `userAnswer` TEXT NULL,
    `isCorrect` BOOLEAN NULL,
    `scoreEarned` DECIMAL(5, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IELTSUserAnswer_attemptId_idx`(`attemptId`),
    UNIQUE INDEX `IELTSUserAnswer_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `Membership`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserUsageQuota` ADD CONSTRAINT `UserUsageQuota_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `Membership`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleParagraph` ADD CONSTRAINT `ArticleParagraph_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserVocabulary` ADD CONSTRAINT `UserVocabulary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserVocabulary` ADD CONSTRAINT `UserVocabulary_wordAnnotationId_fkey` FOREIGN KEY (`wordAnnotationId`) REFERENCES `WordAnnotation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleProgress` ADD CONSTRAINT `ArticleProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleProgress` ADD CONSTRAINT `ArticleProgress_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VocabularyWord` ADD CONSTRAINT `VocabularyWord_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `VocabularyBook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VocabularyBookProgress` ADD CONSTRAINT `VocabularyBookProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VocabularyBookProgress` ADD CONSTRAINT `VocabularyBookProgress_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `VocabularyBook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VocabularyReviewLog` ADD CONSTRAINT `VocabularyReviewLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IELTSExamSection` ADD CONSTRAINT `IELTSExamSection_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `IELTSExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IELTSQuestion` ADD CONSTRAINT `IELTSQuestion_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `IELTSExamSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IELTSAttempt` ADD CONSTRAINT `IELTSAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IELTSAttempt` ADD CONSTRAINT `IELTSAttempt_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `IELTSExam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IELTSUserAnswer` ADD CONSTRAINT `IELTSUserAnswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `IELTSAttempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IELTSUserAnswer` ADD CONSTRAINT `IELTSUserAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `IELTSQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
