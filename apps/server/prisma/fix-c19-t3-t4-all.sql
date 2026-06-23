-- ============================================
-- C19 Test 3 + Test 4 Listening (from KMF)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing T3/T4 data
DELETE FROM IELTSUserAnswer WHERE attemptId IN (SELECT id FROM (SELECT id FROM IELTSAttempt WHERE examId IN (1903,1904)) AS t);
DELETE FROM IELTSAttempt WHERE examId IN (1903,1904);
DELETE FROM IELTSQuestion WHERE sectionId IN (SELECT id FROM IELTSExamSection WHERE examId IN (1903,1904));
DELETE FROM IELTSExamSection WHERE examId IN (1903,1904);
DELETE FROM IELTSExam WHERE id IN (1903,1904);
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- C19 TEST 3
-- ============================================
INSERT INTO IELTSExam (id, title, type, isFullExam, difficultyLevel, totalQuestions, totalSections, durationMinutes, audioUrl, isPublished, createdAt, updatedAt)
VALUES (1903, '剑桥雅思 19 - Test 3 听力', 'listening', TRUE, 'intermediate', 40, 4, 30, NULL, TRUE, NOW(), NOW());

-- ============ T3 Part 1: Local Food Shops ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19031, 1903, 1, 'Part 1', 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.', NOW());

INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19031,1,'fill_blank','Kite Place - near the ______',NULL,'harbour',1,NOW()),
(19031,2,'fill_blank','Fish market: cross the ______ and turn right',NULL,'bridge',1,NOW()),
(19031,3,'fill_blank','Fish market: best to go before ______ pm, earlier than closing time',NULL,'3.30',1,NOW()),
(19031,4,'fill_blank','Organic shop: called "______"',NULL,'Rose',1,NOW()),
(19031,5,'fill_blank','Organic shop: below a restaurant in the large, grey building, look for the large ______ outside',NULL,'sign',1,NOW()),
(19031,6,'fill_blank','Supermarket: take a ______ minibus, number 289',NULL,'purple',1,NOW());

-- Q7-10: Table (passageText on Q7)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, passageText, createdAt) VALUES
(19031,7,'fill_blank','Fish market other ideas: a handful of ______ (type of seaweed)',NULL,'samphire',1,
'[table]\n| | To buy | Other ideas |\n| Fish market | a dozen prawns | a handful of ______ (type of seaweed) |\n| Organic shop | beans and a ______ for dessert | spices and ______ |\n| Bakery | a brown loaf | a ______ tart |',NOW());

INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19031,8,'fill_blank','Organic shop to buy: beans and a ______ for dessert',NULL,'melon',1,NOW()),
(19031,9,'fill_blank','Organic shop other ideas: spices and ______',NULL,'coconut',1,NOW()),
(19031,10,'fill_blank','Bakery other ideas: a ______ tart',NULL,'strawberry',1,NOW());

-- ============ T3 Part 2: Children''s Book Festival Workshops ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19032, 1903, 2, 'Part 2', 'Questions 11-16: What information is given about each of the following festival workshops? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 11-16.\nQuestions 17-18: Choose TWO letters, A-E.\nQuestions 19-20: Choose TWO letters, A-E.', NOW());

-- Q11-16 Matching
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19032,11,'matching','Superheroes','["A. involves painting and drawing","B. will be led by a prize-winning author","C. is aimed at children with a disability","D. involves a drama activity","E. focuses on new relationships","F. is aimed at a specific age group","G. explores an unhappy feeling","H. raises awareness of a particular culture"]','C. is aimed at children with a disability',1,NOW()),
(19032,12,'matching','Just do it','["A. involves painting and drawing","B. will be led by a prize-winning author","C. is aimed at children with a disability","D. involves a drama activity","E. focuses on new relationships","F. is aimed at a specific age group","G. explores an unhappy feeling","H. raises awareness of a particular culture"]','D. involves a drama activity',1,NOW()),
(19032,13,'matching','Count on me','["A. involves painting and drawing","B. will be led by a prize-winning author","C. is aimed at children with a disability","D. involves a drama activity","E. focuses on new relationships","F. is aimed at a specific age group","G. explores an unhappy feeling","H. raises awareness of a particular culture"]','F. is aimed at a specific age group',1,NOW()),
(19032,14,'matching','Speak up','["A. involves painting and drawing","B. will be led by a prize-winning author","C. is aimed at children with a disability","D. involves a drama activity","E. focuses on new relationships","F. is aimed at a specific age group","G. explores an unhappy feeling","H. raises awareness of a particular culture"]','G. explores an unhappy feeling',1,NOW()),
(19032,15,'matching','Jump for joy','["A. involves painting and drawing","B. will be led by a prize-winning author","C. is aimed at children with a disability","D. involves a drama activity","E. focuses on new relationships","F. is aimed at a specific age group","G. explores an unhappy feeling","H. raises awareness of a particular culture"]','B. will be led by a prize-winning author',1,NOW()),
(19032,16,'matching','Sticks and stones','["A. involves painting and drawing","B. will be led by a prize-winning author","C. is aimed at children with a disability","D. involves a drama activity","E. focuses on new relationships","F. is aimed at a specific age group","G. explores an unhappy feeling","H. raises awareness of a particular culture"]','H. raises awareness of a particular culture',1,NOW());

-- Q17-18: Choose TWO (Alive and Kicking)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19032,17,'multiple_choice','Which TWO reasons does the speaker give for recommending Alive and Kicking?','["A. It will appeal to both boys and girls","B. The author is well known","C. It has colourful illustrations","D. It is funny","E. It deals with an important topic"]','D. It is funny',1,NOW()),
(19032,18,'multiple_choice','Which TWO reasons does the speaker give for recommending Alive and Kicking?','["A. It will appeal to both boys and girls","B. The author is well known","C. It has colourful illustrations","D. It is funny","E. It deals with an important topic"]','E. It deals with an important topic',1,NOW());

-- Q19-20: Choose TWO (advice to parents)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19032,19,'multiple_choice','Which TWO pieces of advice does the speaker give to parents about reading?','["A. Encourage children to write down new vocabulary","B. Allow children to listen to audio books","C. Get recommendations from librarians","D. Give children a choice about what they read","E. Only read aloud to children until they can read independently"]','B. Allow children to listen to audio books',1,NOW()),
(19032,20,'multiple_choice','Which TWO pieces of advice does the speaker give to parents about reading?','["A. Encourage children to write down new vocabulary","B. Allow children to listen to audio books","C. Get recommendations from librarians","D. Give children a choice about what they read","E. Only read aloud to children until they can read independently"]','C. Get recommendations from librarians',1,NOW());

-- ============ T3 Part 3: Science Experiment for Year 12 Students ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19033, 1903, 3, 'Part 3', 'Questions 21-25: Choose the correct letter, A, B or C.\nQuestions 26-30: Complete the flowchart below. Write ONE WORD ONLY for each answer.', NOW());

-- Q21-25: Multiple choice (single)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19033,21,'multiple_choice','How does Clare feel about the students in her Year 12 science class?','["A. She is worried they will not achieve high grades","B. She thinks they have become increasingly mature","C. She is frustrated at their lack of interest in the subject"]','C. She is frustrated at their lack of interest in the subject',1,NOW()),
(19033,22,'multiple_choice','How does Jake react to Clare''s suggestion about an experiment based on children''s diet?','["A. He is concerned that the results might not be reliable","B. He feels some of the data might be difficult to obtain","C. He thinks it would be too complicated to set up"]','B. He feels some of the data might be difficult to obtain',1,NOW()),
(19033,23,'multiple_choice','What problem do they agree may be involved in an experiment involving animals?','["A. Any results may not apply to humans","B. It could cause stress to the animals","C. Ethical approval might not be granted"]','A. Any results may not apply to humans',1,NOW()),
(19033,24,'multiple_choice','What question do they decide the experiment should address?','["A. Are mice capable of controlling their food intake?","B. Do mice prefer sweet foods to savoury ones?","C. Is a diet high in sugar bad for mice?"]','A. Are mice capable of controlling their food intake?',1,NOW()),
(19033,25,'multiple_choice','Clare might also consider doing another experiment involving','["A. the effects of different types of food","B. the timing of food consumption","C. varying amounts of exercise"]','C. varying amounts of exercise',1,NOW());

-- Q26-30: Flowchart completion (fill_blank)
-- Q26-30: Matching (flowchart - choose from box)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19033,26,'matching','Select mice of the same ______','["A. size","B. escape","C. age","D. water","E. cereal","F. calculations","G. changes","H. colour"]','C. age',1,NOW()),
(19033,27,'matching','Use ______ to mark the different groups of mice','["A. size","B. escape","C. age","D. water","E. cereal","F. calculations","G. changes","H. colour"]','H. colour',1,NOW()),
(19033,28,'matching','Give mice ______ as well as sugar','["A. size","B. escape","C. age","D. water","E. cereal","F. calculations","G. changes","H. colour"]','E. cereal',1,NOW()),
(19033,29,'matching','Use a weighing chamber to prevent the mice from making an ______','["A. size","B. escape","C. age","D. water","E. cereal","F. calculations","G. changes","H. colour"]','B. escape',1,NOW()),
(19033,30,'matching','Do ______ to work out averages and standard deviation','["A. size","B. escape","C. age","D. water","E. cereal","F. calculations","G. changes","H. colour"]','F. calculations',1,NOW());

-- ============ T3 Part 4: Microplastics ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19034, 1903, 4, 'Part 4', 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 Where microplastics come from\n## Q32 Effects of microplastics\n## Q36 Microplastics in the soil – a study by Anglia Ruskin University\n## Q40 The study concluded', NOW());

INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19034,31,'fill_blank','Fibres from some ______ during washing',NULL,'clothing',1,NOW()),
(19034,32,'fill_blank','They cause injuries to the ______ of wildlife and affect their digestive systems',NULL,'mouths',1,NOW()),
(19034,33,'fill_blank','They enter the food chain, e.g., in bottled and tap water, ______ and seafood',NULL,'salt',1,NOW()),
(19034,34,'fill_blank','They may not affect human health, but they are already banned in skin cleaning products and ______ in some countries',NULL,'toothpaste',1,NOW()),
(19034,35,'fill_blank','Microplastics enter the soil through the air, rain and ______',NULL,'fertilisers',1,NOW()),
(19034,36,'fill_blank','Earthworms are important because they add ______ to the soil',NULL,'nutrients',1,NOW()),
(19034,37,'fill_blank','The study aimed to find whether microplastics in earthworms affect the ______ of plants',NULL,'growth',1,NOW()),
(19034,38,'fill_blank','The study found that microplastics caused ______ loss in earthworms',NULL,'weight',1,NOW()),
(19034,39,'fill_blank','A rise in the level of ______ in the soil',NULL,'acid',1,NOW()),
(19034,40,'fill_blank','Changes to soil damage both ecosystems and ______',NULL,'society',1,NOW());

-- ============================================
-- C19 TEST 4
-- ============================================
INSERT INTO IELTSExam (id, title, type, isFullExam, difficultyLevel, totalQuestions, totalSections, durationMinutes, audioUrl, isPublished, createdAt, updatedAt)
VALUES (1904, '剑桥雅思 19 - Test 4 听力', 'listening', TRUE, 'intermediate', 40, 4, 30, NULL, TRUE, NOW(), NOW());

-- ============ T4 Part 1: First Day at Work ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19041, 1904, 1, 'Part 1', 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.', NOW());

INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19041,1,'fill_blank','Name of supervisor: ______',NULL,'Kaeden',1,NOW()),
(19041,2,'fill_blank','Where to leave coat and bag: use ______ in staffroom',NULL,'locker',1,NOW()),
(19041,3,'fill_blank','See Tiffany in HR: to give ______ number',NULL,'passport',1,NOW()),
(19041,4,'fill_blank','See Tiffany in HR: to collect ______',NULL,'uniform',1,NOW()),
(19041,5,'fill_blank','Location of HR office: on ______ floor',NULL,'third',1,NOW()),
(19041,6,'fill_blank','Supervisor''s mobile number: ______',NULL,'0412 665 903',1,NOW());

-- Q7-10: Table (passageText on Q7)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, passageText, createdAt) VALUES
(19041,7,'fill_blank','Bakery section: Use ______ labels for price changes',NULL,'yellow',1,
'[table]\n| Responsibilities | Task 1 | Task 2 | Notes |\n| Bakery section | Check sell-by dates | Change price labels | Use ______ labels |\n| Sushi takeaway counter | Re-stock with ______ boxes if needed | Wipe preparation area and clean the sink | Do not clean any knives |\n| Meat and fish counters | Clean the serving area, including the weighing scales | Collect ______ for the fish from the cold-room | Must wear special ______ |',NOW());

INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19041,8,'fill_blank','Sushi counter: Re-stock with ______ boxes if needed',NULL,'plastic',1,NOW()),
(19041,9,'fill_blank','Meat and fish: Collect ______ for the fish from the cold-room',NULL,'ice',1,NOW()),
(19041,10,'fill_blank','Meat and fish cold-room: Must wear special ______',NULL,'gloves',1,NOW());

-- ============ T4 Part 2: Running for Beginners ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19042, 1904, 2, 'Part 2', 'Questions 11-12: Choose TWO letters, A-E.\nQuestions 13-14: Choose TWO letters, A-E.\nQuestions 15-18: What reason prevented each member from joining until recently?\nQuestions 19-20: Choose the correct letter, A, B or C.', NOW());

-- Q11-12: Choose TWO (problems with training programmes)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19042,11,'multiple_choice','Which TWO problems with some training programmes for new runners does Liz mention?','["A. There is a risk of serious injury","B. They are unsuitable for certain age groups","C. They are unsuitable for people with health issues","D. It is difficult to stay motivated","E. There is a lack of individual support"]','C. They are unsuitable for people with health issues',1,NOW()),
(19042,12,'multiple_choice','Which TWO problems with some training programmes for new runners does Liz mention?','["A. There is a risk of serious injury","B. They are unsuitable for certain age groups","C. They are unsuitable for people with health issues","D. It is difficult to stay motivated","E. There is a lack of individual support"]','E. There is a lack of individual support',1,NOW());

-- Q13-14: Choose TWO (tips for new runners)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19042,13,'multiple_choice','Which TWO tips does Liz recommend for new runners?','["A. doing two runs a week","B. running in the evening","C. going on runs with a friend","D. listening to music during runs","E. running very slowly"]','A. doing two runs a week',1,NOW()),
(19042,14,'multiple_choice','Which TWO tips does Liz recommend for new runners?','["A. doing two runs a week","B. running in the evening","C. going on runs with a friend","D. listening to music during runs","E. running very slowly"]','D. listening to music during runs',1,NOW());

-- Q15-18: Matching (reason prevented joining)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19042,15,'matching','Ceri','["A. a lack of confidence","B. a dislike of running","C. a lack of time"]','A. a lack of confidence',1,NOW()),
(19042,16,'matching','James','["A. a lack of confidence","B. a dislike of running","C. a lack of time"]','B. a dislike of running',1,NOW()),
(19042,17,'matching','Leo','["A. a lack of confidence","B. a dislike of running","C. a lack of time"]','C. a lack of time',1,NOW()),
(19042,18,'matching','Mark','["A. a lack of confidence","B. a dislike of running","C. a lack of time"]','A. a lack of confidence',1,NOW());

-- Q19-20: Multiple choice (single)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19042,19,'multiple_choice','What does Liz say about running her first marathon?','["A. It had always been her ambition","B. Her husband persuaded her to do it","C. She nearly gave up before the end"]','C. She nearly gave up before the end',1,NOW()),
(19042,20,'multiple_choice','Liz says new runners should sign up for a race','["A. every six months","B. within a few weeks of taking up running","C. after completing several practice runs"]','B. within a few weeks of taking up running',1,NOW());

-- ============ T4 Part 3: Books ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19043, 1904, 3, 'Part 3', 'Questions 21-25: Choose the correct letter, A, B or C.\nQuestions 26-30: Where does Jane''s grandfather keep each type of book? Choose the correct letter, A-G.', NOW());

-- Q21-25: Multiple choice (single)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19043,21,'multiple_choice','Kieran thinks the packing advice given by Jane''s grandfather is','["A. common sense","B. hard to follow","C. over-protective"]','A. common sense',1,NOW()),
(19043,22,'multiple_choice','How does Jane feel about the books her grandfather has given her?','["A. They are not worth keeping","B. They should go to a collector","C. They have sentimental value for her"]','C. They have sentimental value for her',1,NOW()),
(19043,23,'multiple_choice','Jane and Kieran agree that hardback books should be','["A. put out on display","B. given as gifts to visitors","C. more attractively designed"]','A. put out on display',1,NOW()),
(19043,24,'multiple_choice','While talking about taking a book from a shelf, Jane','["A. describes the mistakes other people make doing it","B. reflects on a significant childhood experience","C. explains why some books are easier to remove than others"]','B. reflects on a significant childhood experience',1,NOW()),
(19043,25,'multiple_choice','What do Jane and Kieran suggest about new books?','["A. Their parents liked buying them as presents","B. They would like to buy more of them","C. Not everyone can afford them"]','C. Not everyone can afford them',1,NOW());

-- Q26-30: Matching (book locations)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19043,26,'matching','Rare books','["A. near the entrance","B. in the attic","C. at the back of the shop","D. on a high shelf","E. near the stairs","F. in a specially designed space","G. within the cafe"]','D. on a high shelf',1,NOW()),
(19043,27,'matching','Children''s books','["A. near the entrance","B. in the attic","C. at the back of the shop","D. on a high shelf","E. near the stairs","F. in a specially designed space","G. within the cafe"]','F. in a specially designed space',1,NOW()),
(19043,28,'matching','Unwanted books','["A. near the entrance","B. in the attic","C. at the back of the shop","D. on a high shelf","E. near the stairs","F. in a specially designed space","G. within the cafe"]','A. near the entrance',1,NOW()),
(19043,29,'matching','Requested books','["A. near the entrance","B. in the attic","C. at the back of the shop","D. on a high shelf","E. near the stairs","F. in a specially designed space","G. within the cafe"]','C. at the back of the shop',1,NOW()),
(19043,30,'matching','Coursebooks','["A. near the entrance","B. in the attic","C. at the back of the shop","D. on a high shelf","E. near the stairs","F. in a specially designed space","G. within the cafe"]','G. within the cafe',1,NOW());

-- ============ T4 Part 4: Tree Planting ============
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(19044, 1904, 4, 'Part 4', 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 Tree planting\n## Q35 Large-scale reforestation projects\n## Q37 Lampang Province, Northern Thailand\n## Q39 Involving local communities', NOW());

INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19044,31,'fill_blank','Not include invasive species because of possible ______ with native species',NULL,'competition',1,NOW()),
(19044,32,'fill_blank','Aim to capture carbon, protect the environment and provide sustainable sources of ______ for local people',NULL,'food',1,NOW()),
(19044,33,'fill_blank','Use tree seeds with a high genetic diversity to increase resistance to ______ and climate change',NULL,'disease',1,NOW()),
(19044,34,'fill_blank','Plant trees on previously forested land which is in a bad condition, not select land which is being used for ______',NULL,'agriculture',1,NOW()),
(19044,35,'fill_blank','Base planning decisions on information from accurate ______',NULL,'maps',1,NOW()),
(19044,36,'fill_blank','Drones are useful for identifying areas in Brazil which are endangered by keeping ______ and illegal logging',NULL,'cattle',1,NOW()),
(19044,37,'fill_blank','A variety of native fig trees were planted, which are important for increasing the ______ of recovery',NULL,'speed',1,NOW()),
(19044,38,'fill_blank','By attracting animals and birds, e.g., ______ were soon attracted to the area',NULL,'monkeys',1,NOW()),
(19044,39,'fill_blank','Destruction of mangrove forests in Madagascar made it difficult for people to make a living from ______',NULL,'fishing',1,NOW()),
(19044,40,'fill_blank','The mangrove reforestation project protects against the higher risk of ______',NULL,'flooding',1,NOW());
