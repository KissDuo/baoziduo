-- ============================================
-- IELTS Reading: Cambridge 20 Test 2
-- 3 Passages, 40 Questions, 60 minutes
-- ============================================

INSERT INTO `IELTSExam` (`id`, `title`, `type`, `isFullExam`, `difficultyLevel`, `totalQuestions`, `totalSections`, `durationMinutes`, `isPublished`, `createdAt`, `updatedAt`)
VALUES (20, '剑桥雅思 20 - Test 2 阅读', 'reading', TRUE, 'intermediate', 40, 3, 60, TRUE, NOW(), NOW());

-- ============================================
-- Section 1: Manatees (Q1-13)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(210, 20, 1, 'Passage 1: Manatees',
'The manatee is a large, aquatic mammal that inhabits coastal waters, rivers and estuaries in tropical and subtropical regions. Often referred to as sea cows, manatees are gentle herbivores that spend most of their time grazing on aquatic vegetation. There are three species of manatee: the West Indian manatee, the Amazonian manatee, and the West African manatee.

In contrast to the dugong, which has a fluked tail similar to that of a whale, the manatee has a broad, rounded tail. Manatees are not particularly agile swimmers. While a dolphin can turn swiftly using its tail, a manatee must turn its entire body, steering with its flippers. These flippers are also used to walk along the seafloor, to hold food, and even to embrace other manatees. Manatees have small eyes that can close in a circular motion, and they lack external ear flaps. Interestingly, they have hairs covering their bodies which help them sense vibrations in the water.

Seagrasses and other marine plants make up most of a manatee''s diet. An adult manatee can consume up to 10% of its body weight in vegetation each day. Manatees have uniquely adapted lips which are divided into two halves that can move independently, helping them tear food away from the seafloor. They use their muscular diaphragm and breathing to adjust their buoyancy, allowing them to rise and sink effortlessly as they feed at different depths.

Manatees can be found in both fresh and salt water. The West Indian manatee, for example, inhabits coastal mangroves, reefs, rivers, lakes and lagoons. The Antillean manatee, a subspecies of the West Indian manatee, is found throughout the Caribbean. The Amazonian manatee inhabits the freshwater Amazon River basin. The West African manatee inhabits the west coast of Africa, including both coastal waters and inland rivers.

All three species are classified as vulnerable to extinction. It is estimated that around 140,000 Amazonian manatees were killed by commercial hunters between 1935 and 1954. Today, habitat loss, boat strikes, entanglement in fishing nets, and pollution continue to threaten manatee populations. The two subspecies of the West Indian manatee are expected to undergo a decline of 20% over the next 40 years. Between 2009 and 2020, at least 700 manatees in Florida were reported to have died as a result of entanglement, net or plastic incidents. However, laws in Florida limit boat speeds in winter, which has been shown to reduce the danger of boat strikes.', NOW());

-- Questions 1-6: Notes Completion
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(210, 1, 'fill_blank', 'Unlike the dugong, the manatee has a broad, rounded ______.', NULL, 'tail', 1.0, '"the manatee has a broad, rounded tail, whereas the dugong''s is fluked"', NOW()),
(210, 2, 'fill_blank', 'The manatee turns its whole body, steering with its ______.', NULL, 'flippers', 1.0, '"a manatee must turn its entire body, steering with its flippers"', NOW()),
(210, 3, 'fill_blank', 'Manatees have ______ on their bodies that detect vibrations in the water.', NULL, 'hairs', 1.0, '"hairs covering their bodies which help them sense vibrations in the water"', NOW()),
(210, 4, 'fill_blank', 'The majority of a manatee''s diet consists of ______ and other marine plants.', NULL, 'seagrasses', 1.0, '"Seagrasses and other marine plants make up most of a manatee''s diet"', NOW()),
(210, 5, 'fill_blank', 'Manatees have specially adapted ______ which help to pull food from the sea floor.', NULL, 'lips', 1.0, '"manatees have lips which … help tear food away from the seafloor"', NOW()),
(210, 6, 'fill_blank', 'Manatees use their diaphragm and breathing to control their ______ in the water.', NULL, 'buoyancy', 1.0, '"use their muscular diaphragm and breathing to adjust their buoyancy"', NOW());

-- Questions 7-13: T/F/NG
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(210, 7, 'true_false', 'The manatee moves between areas of fresh water and areas of salt water.', NULL, 'TRUE', 1.0, 'Found in fresh and salt water: coastal mangroves, reefs, rivers, lakes, lagoons.', NOW()),
(210, 8, 'true_false', 'The water where the Antillean manatee lives is rarely above a certain temperature.', NULL, 'NOT GIVEN', 1.0, 'No information about water temperature is given.', NOW()),
(210, 9, 'true_false', 'The West African manatee is only found in coastal waters.', NULL, 'FALSE', 1.0, 'Also found in inland rivers, not only coastal waters.', NOW()),
(210, 10, 'true_false', 'It was discovered during the 1950s that large numbers of Amazonian manatees had been killed.', NULL, 'NOT GIVEN', 1.0, 'Numbers killed mentioned but not when the loss was first discovered.', NOW()),
(210, 11, 'true_false', 'Both subspecies of the West Indian manatee are expected to decrease significantly in number over the next few decades.', NULL, 'TRUE', 1.0, 'Both "are expected to undergo a decline of 20% over the next 40 years."', NOW()),
(210, 12, 'true_false', 'Recent years have seen an increase in reports of manatees becoming entangled in nets.', NULL, 'NOT GIVEN', 1.0, 'At least 700 died from entanglement, but no mention of an increase.', NOW()),
(210, 13, 'true_false', 'In Florida, laws have been introduced to reduce the danger of boats hitting manatees.', NULL, 'TRUE', 1.0, '"laws in Florida limit boat speeds in winter, reducing the danger of boat strikes."', NOW());

-- ============================================
-- Section 2: Procrastination (Q14-26)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(220, 20, 2, 'Passage 2: Procrastination',
'**A** Procrastination is the act of unnecessarily delaying a task that needs to be completed, even though we are aware there will be negative consequences as a result. It is a common human experience — surveys suggest that 80–95% of university students engage in procrastination, and approximately 20% of adults identify themselves as chronic procrastinators. Despite its prevalence, procrastination remains widely misunderstood.

**B** Contrary to popular belief, procrastination is not simply a matter of laziness or poor time management. Research using brain imaging techniques has shown that procrastination is linked to the way our brains regulate emotion. When we are faced with a task that makes us feel anxious or stressed, the amygdala — the part of the brain responsible for processing emotions — perceives the task as a threat. To cope with this negative emotion, we avoid the task, choosing instead to do something that makes us feel better in the short term. This is why procrastination is increasingly understood as a problem of mood regulation rather than time management.

**C** Certain personality traits make people more susceptible to procrastination. Perfectionists, for example, often procrastinate because they fear they will not be able to complete a task to their own impossibly high standards. People with low self-esteem may doubt their ability to complete a task and therefore put it off. Those who are impulsive are also more likely to procrastinate because they find it harder to resist immediate temptations in favour of long-term goals.

**D** The consequences of chronic procrastination can be severe. Research has linked procrastination to lower academic performance, reduced annual income, and less employment stability. Procrastinators also tend to experience higher levels of stress and guilt, and are more likely to suffer from health problems, possibly because they delay seeking medical treatment and engaging in healthy behaviours.

**E** Breaking the cycle of procrastination is possible, but it requires understanding the underlying emotional causes. One effective strategy is self-forgiveness — research has shown that students who forgave themselves for procrastinating on an earlier exam were less likely to procrastinate on a subsequent one. Another important approach is managing your environment to remove distractions, such as turning off phone notifications or using website blockers during work periods.

**F** Ultimately, it is important to remember that we are not the first person to procrastinate, nor the last. Procrastination is a near-universal human experience. The key is not to eliminate it entirely — which is probably impossible — but to develop strategies that allow us to manage it effectively and reduce its impact on our lives.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
-- 14-16: Matching to paragraph
(220, 14, 'multiple_choice', 'Which paragraph challenges false assumptions about why people procrastinate?', '["A","B","C","D","E","F"]', 'B', 1.0, 'Para B: procrastination is NOT due to laziness or poor time management.', NOW()),
(220, 15, 'multiple_choice', 'Which paragraph contains a realisation that others also procrastinate?', '["A","B","C","D","E","F"]', 'F', 1.0, '"we''re not the first person to procrastinate, nor the last."', NOW()),
(220, 16, 'multiple_choice', 'Which paragraph refers to brain imaging research?', '["A","B","C","D","E","F"]', 'B', 1.0, '"Research using brain imaging techniques has shown…"', NOW());

-- 17-22: Summary Completion
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(220, 17, 'fill_blank', 'Procrastination is not caused by ______ or poor time management, as many people think.', NULL, 'laziness', 1.0, '"not simply a matter of laziness or poor time management."', NOW()),
(220, 18, 'fill_blank', 'When we face a task that makes us feel ______, our brain perceives it as a threat.', NULL, 'anxious', 1.0, '"a task that makes us feel anxious or stressed."', NOW()),
(220, 19, 'fill_blank', 'The amygdala perceives tasks we want to avoid as ______.', NULL, 'threats', 1.0, '"the amygdala ... perceives the task as a threat."', NOW()),
(220, 20, 'fill_blank', 'Students who forgave themselves for procrastinating on earlier ______ were less likely to procrastinate later.', NULL, 'exams', 1.0, '"students who forgave themselves for procrastinating on an earlier exam."', NOW()),
(220, 21, 'fill_blank', '______ are particularly prone to procrastination because of their high standards.', NULL, 'perfectionists', 1.0, '"Perfectionists ... procrastinate because they fear they will not be able to complete a task."', NOW()),
(220, 22, 'fill_blank', 'Chronic procrastinators experience higher levels of stress and ______.', NULL, 'guilt', 1.0, '"Procrastinators also tend to experience higher levels of stress and guilt."', NOW());

-- 23-26: Multiple Choice (Choose TWO)
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(220, 23, 'multiple_choice', 'Which TWO effects does chronic procrastination have on employees?', '["Less annual income","More sick leave","Less employment stability","Slower career progression","Poorer working relationships"]', 'Less annual income', 1.0, '"reduced annual income" and "less employment stability."', NOW()),
(220, 24, 'multiple_choice', 'Which TWO effects does chronic procrastination have on employees?', '["Less annual income","More sick leave","Less employment stability","Slower career progression","Poorer working relationships"]', 'Less employment stability', 1.0, '"reduced annual income" and "less employment stability."', NOW()),
(220, 25, 'multiple_choice', 'Which TWO strategies are recommended to break the procrastination cycle?', '["Forgive yourself","Set stricter deadlines","Work longer hours","Reward yourself after tasks","Manage distractions"]', 'Forgive yourself', 1.0, '"self-forgiveness" and "remove distractions."', NOW()),
(220, 26, 'multiple_choice', 'Which TWO strategies are recommended to break the procrastination cycle?', '["Forgive yourself","Set stricter deadlines","Work longer hours","Reward yourself after tasks","Manage distractions"]', 'Manage distractions', 1.0, '"self-forgiveness" and "remove distractions."', NOW());

-- ============================================
-- Section 3: Invasion of the Robot Umpires (Q27-40)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(230, 20, 3, 'Passage 3: Invasion of the Robot Umpires',
'In a minor league baseball game in 2019, umpire Derek DeJesus had ball-and-strike decisions fed to him through an earpiece. For the first time in history, a computer — not a human — was making the most important judgment calls in baseball. The Automated Ball-Strike system, or ABS, uses radar and cameras to track each pitch and determine with near-perfect precision whether it passes through the strike zone.

The system was not without controversy. After early trials, Major League Baseball (MLB) tweaked the strike zone dimensions because players complained that the ABS was calling strikes on pitches that looked strange — technically correct but visually jarring. The strike zone had been a subjective space, an "imaginary zone" that both pitchers and batters understood through years of experience. Now, a machine was enforcing it with unforgiving accuracy.

The rise of the 100-mph fastball had flattened the game, making it less about strategy and more about sheer power. Strikeouts had overtaken hits for the first time in history. Something needed to change. MLB saw ABS as a perfect vehicle for addressing these concerns. But many within the sport wondered: at what cost does perfection come?

In the first game to use the system, nobody said a word about the calls. The usual arguments between managers and umpires, the theatrical ejections, the tension that defined the sport — all of it evaporated. Some found this refreshing; others found it unsettling.

The philosophical question at the heart of the ABS debate is whether sport should pursue perfect accuracy at the expense of its human character. A perfectly officiated game removes the dialogue between pitcher, catcher, and umpire. As baseball writer Joe Posnanski observed, "The strike zone could be shaped as a triangle, or a blob, or something shaped like Texas — the computer would still call it perfectly." The question is not whether technology can make sport fairer; it almost certainly can. The question is whether fairness alone is what makes sport meaningful.

In many ways, baseball''s ABS experiment is a microcosm of a larger debate about technology in society. From self-driving cars to AI judges, we are increasingly asking machines to make decisions that were once the exclusive domain of human judgment. The baseball diamond, it turns out, is as good a place as any to ask the fundamental question: what do we lose when we eliminate human error?', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(230, 27, 'true_false', 'In the 2019 game, both ABS and the umpire shared responsibility for making judgments.', NULL, 'NO', 1.0, 'DeJesus had decisions fed to him — judgments were made ONLY by ABS.', NOW()),
(230, 28, 'true_false', 'MLB changed the strike zone dimensions after players expressed concerns.', NULL, 'YES', 1.0, '"MLB tweaked the strike zone dimensions because players complained."', NOW()),
(230, 29, 'true_false', 'The cost of the ABS system is too high for most minor league teams.', NULL, 'NOT GIVEN', 1.0, 'No mention of the cost of the ABS system.', NOW()),
(230, 30, 'true_false', 'The 100-mph fastball made baseball more exciting to watch.', NULL, 'NO', 1.0, 'It "flattened the game" — made play less exciting, not more.', NOW()),
(230, 31, 'true_false', 'There was fierce debate within the development team about introducing ABS.', NULL, 'NOT GIVEN', 1.0, '"ABS was seen as a perfect vehicle" suggests agreement, no debate mentioned.', NOW()),
(230, 32, 'true_false', 'The strike zone could theoretically be defined in very unusual shapes.', NULL, 'YES', 1.0, 'Could be shaped as "a triangle, or a blob, or something shaped like Texas."', NOW());

-- 33-37: Summary Matching
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(230, 33, 'multiple_choice', 'Former roles: human umpires continue to ______.', '["call more strikes","argue with managers","use instant replay","make subjective assessments","rely on technology","announce calls as before","challenge the computer","interpret the rules"]', 'announce calls as before', 1.0, 'Umpires announce the computer''s call.', NOW()),
(230, 34, 'multiple_choice', 'Subjective assessment: calling a strike was always ______.', '["call more strikes","argue with managers","use instant replay","a judgment call","rely on technology","announce calls as before","challenge the computer","interpret the rules"]', 'a judgment call', 1.0, 'Calling a strike was subjective.', NOW()),
(230, 35, 'multiple_choice', 'Perceived area: the strike zone was an ______.', '["call more strikes","argue with managers","use instant replay","a judgment call","rely on technology","announce calls as before","challenge the computer","imaginary zone"]', 'imaginary zone', 1.0, 'The strike zone was an "imaginary zone."', NOW()),
(230, 36, 'multiple_choice', 'Numerous disputes: there were ______ over strike calls.', '["countless arguments","a judgment call","use instant replay","a judgment call","rely on technology","announce calls as before","challenge the computer","imaginary zone"]', 'countless arguments', 1.0, '"countless arguments" over strike calls in traditional baseball.', NOW()),
(230, 37, 'multiple_choice', 'Total silence: ______ in the first game using ABS.', '["countless arguments","a judgment call","use instant replay","a judgment call","rely on technology","announce calls as before","challenge the computer","Nobody said a word"]', 'Nobody said a word', 1.0, '"Nobody said a word" in the first ABS game.', NOW());

-- 38-40: Multiple Choice
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(230, 38, 'multiple_choice', 'What concern does the writer raise about ABS?', '["It is too slow","Accuracy may reduce the game''s appeal","It is too expensive","Players will ignore it"]', 'Accuracy may reduce the game''s appeal', 1.0, 'ABS is "unforgiving and pedantic," removing human dialogue.', NOW()),
(230, 39, 'multiple_choice', 'What was the purpose of rule changes in baseball?', '["To increase revenue","To make games shorter","To improve player safety","To keep younger fans interested"]', 'To keep younger fans interested', 1.0, 'Rules changed to attract younger audiences.', NOW()),
(230, 40, 'multiple_choice', 'What is the writer''s overall conclusion about technology in sport?', '["It should be banned","It always improves the game","Accuracy does not equal enjoyment","Human umpires are better"]', 'Accuracy does not equal enjoyment', 1.0, 'Technology enhances fairness but can diminish human emotion.', NOW());
