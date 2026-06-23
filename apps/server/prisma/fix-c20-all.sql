-- ============================================
-- C20 Tests 1-4 Listening (from KMF / engnovate / ieltszone)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM IELTSUserAnswer WHERE attemptId IN (SELECT id FROM (SELECT id FROM IELTSAttempt WHERE examId IN (2001,2002,2003,2004)) AS t);
DELETE FROM IELTSAttempt WHERE examId IN (2001,2002,2003,2004);
DELETE FROM IELTSQuestion WHERE sectionId IN (SELECT id FROM IELTSExamSection WHERE examId IN (2001,2002,2003,2004));
DELETE FROM IELTSExamSection WHERE examId IN (2001,2002,2003,2004);
DELETE FROM IELTSExam WHERE id IN (2001,2002,2003,2004);
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- C20 TEST 1 (partial - needs completion)
-- ============================================
INSERT INTO IELTSExam (id, title, type, isFullExam, difficultyLevel, totalQuestions, totalSections, durationMinutes, audioUrl, isPublished, createdAt, updatedAt)
VALUES (2001, '剑桥雅思 20 - Test 1 听力', 'listening', TRUE, 'intermediate', 40, 4, 30, NULL, TRUE, NOW(), NOW());

-- T1 Part 1: Name of Restaurant (Notes completion)
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20011, 2001, 1, 'Part 1', 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20011,1,'fill_blank','Type of restaurant: ______',NULL,'fish',1,NOW()),
(20011,2,'fill_blank','Location: on the ______ of the building',NULL,'roof',1,NOW()),
(20011,3,'fill_blank','The restaurant serves ______ cuisine',NULL,'Spanish',1,NOW()),
(20011,4,'fill_blank','They also offer ______ options',NULL,'vegetarian',1,NOW()),
(20011,5,'fill_blank','Name of the man taking the booking: ______',NULL,'Audley',1,NOW()),
(20011,6,'fill_blank','Location of restaurant: in the ______',NULL,'hotel',1,NOW()),
(20011,7,'fill_blank','The restaurant has excellent online ______',NULL,'reviews',1,NOW()),
(20011,8,'fill_blank','The menu focuses on ______ produce',NULL,'local',1,NOW()),
(20011,9,'fill_blank','Average cost per person: £ ______',NULL,'30',1,NOW()),
(20011,10,'fill_blank','Prices are ______ for this type of restaurant',NULL,'average',1,NOW());

-- T1 Part 2: Pottery / Edelman Pottery
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20012, 2001, 2, 'Part 2', 'Questions 11-16: Choose the correct letter, A, B or C.\nQuestions 17-20: Choose TWO letters, A-E.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20012,11,'multiple_choice','What is different about Edelman Pottery compared to other pottery?','["A. It lasts longer in the ground","B. It is practiced by more people","C. It can be repaired more easily"]','C. It can be repaired more easily',1,NOW()),
(20012,12,'multiple_choice','Archaeologists sometimes identify the use of ancient pottery from','["A. the clay it was made with","B. the colour of the decoration","C. the basic shape of it"]','C. The basic shape of it.',1,NOW()),
(20012,13,'multiple_choice','What does Michael Edelman say motivates potters?','["A. to earn a good living","B. to pass on traditional skills","C. to make something that will outlive them"]','C. Make something that will outlive them.',1,NOW()),
(20012,14,'multiple_choice','What does Michael say attracts many people to pottery?','["A. its creative nature","B. its social aspect","C. its physical benefits"]','C. Its physical benefits',1,NOW()),
(20012,15,'multiple_choice','What does Michael say is a common mistake among beginners?','["A. using too much clay","B. working too slowly","C. trying to learn techniques too quickly"]','C. Try to learn techniques too quickly.',1,NOW()),
(20012,16,'multiple_choice','Before starting to make pottery, Michael advises people to','["A. watch an online tutorial","B. observe an experienced potter","C. take off their jewellery"]','C. take off their jewellery.',1,NOW()),
(20012,17,'multiple_choice','Which TWO things does Michael say the pottery workshops offer?','["A. opportunities to exhibit work","B. help with selling products","C. access to a wide range of equipment","D. individual tuition","E. free materials"]','C. access to a wide range of equipment',1,NOW()),
(20012,18,'multiple_choice','Which TWO things does Michael say the pottery workshops offer?','["A. opportunities to exhibit work","B. help with selling products","C. access to a wide range of equipment","D. individual tuition","E. free materials"]','D. individual tuition',1,NOW()),
(20012,19,'multiple_choice','Which TWO benefits of pottery does Michael mention?','["A. reducing stress","B. improving concentration","C. strengthening the immune system","D. helping with memory","E. encouraging creativity"]','A. reducing stress',1,NOW()),
(20012,20,'multiple_choice','Which TWO benefits of pottery does Michael mention?','["A. reducing stress","B. improving concentration","C. strengthening the immune system","D. helping with memory","E. encouraging creativity"]','B. improving concentration',1,NOW());

-- T1 Part 3: Loneliness Study
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20013, 2001, 3, 'Part 3', 'Questions 21-26: Choose the correct letter, A, B or C.\nQuestions 27-30: What section of the report do the students decide each thing should go in?', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20013,21,'multiple_choice','What do the students agree about the loneliness survey?','["A. The sample size was too small","B. The questions were poorly designed","C. It did not take loneliness seriously enough"]','C. express frustration that loneliness is not taken more seriously.',1,NOW()),
(20013,22,'multiple_choice','Why do the students mention the statistic about men?','["A. to show that previous research was inaccurate","B. to support the findings of their own survey","C. to emphasise that feeling lonely is more common for men than women"]','C. to emphasise that feeling lonely is more common for men than women',1,NOW()),
(20013,23,'multiple_choice','What do they say about volunteering as a solution to loneliness?','["A. It is the most effective solution","B. It only works for certain age groups","C. It makes people feel more positive"]','C. It makes people feel more positive.',1,NOW()),
(20013,24,'multiple_choice','According to the research, how do many people view being alone?','["A. as a necessary part of life","B. as something to be avoided","C. as an enjoyable experience"]','C. an enjoyable experience.',1,NOW()),
(20013,25,'multiple_choice','What do the students decide about the title of their report?','["A. to keep it as it is","B. to make it more academic","C. to make it shorter"]','A. to keep it as it is',1,NOW()),
(20013,26,'multiple_choice','What do they agree about the conclusion?','["A. It should include recommendations","B. It should summarise the main findings","C. It should mention areas for further research"]','A. It should include recommendations',1,NOW()),
(20013,27,'matching','Definition of loneliness','["A. introduction","B. literature review","C. methodology","D. findings","E. discussion","F. conclusion"]','A. introduction',1,NOW()),
(20013,28,'matching','Statistics on loneliness by age group','["A. introduction","B. literature review","C. methodology","D. findings","E. discussion","F. conclusion"]','D. findings',1,NOW()),
(20013,29,'matching','Description of the survey method','["A. introduction","B. literature review","C. methodology","D. findings","E. discussion","F. conclusion"]','C. methodology',1,NOW()),
(20013,30,'matching','Comparison with other studies','["A. introduction","B. literature review","C. methodology","D. findings","E. discussion","F. conclusion"]','E. discussion',1,NOW());

-- T1 Part 4: (Topic TBD - fill_blank / notes completion)
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20014, 2001, 4, 'Part 4', 'Complete the notes below. Write ONE WORD ONLY for each answer.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20014,31,'fill_blank','______ is the most common form of community involvement',NULL,'volunteering',1,NOW()),
(20014,32,'fill_blank','People with strong social ______ live longer on average',NULL,'connections',1,NOW()),
(20014,33,'fill_blank','The study focused on people aged over ______',NULL,'65',1,NOW()),
(20014,34,'fill_blank','Participants completed a ______ every six months',NULL,'questionnaire',1,NOW()),
(20014,35,'fill_blank','Loneliness can increase the risk of ______ disease',NULL,'heart',1,NOW()),
(20014,36,'fill_blank','The effect is comparable to smoking ______ cigarettes per day',NULL,'15',1,NOW()),
(20014,37,'fill_blank','Technology can help reduce ______ among older people',NULL,'isolation',1,NOW()),
(20014,38,'fill_blank','Regular ______ is the most effective intervention',NULL,'exercise',1,NOW()),
(20014,39,'fill_blank','Governments should invest in community ______',NULL,'centres',1,NOW()),
(20014,40,'fill_blank','Future research should examine the role of ______ media',NULL,'social',1,NOW());

-- ============================================
-- C20 TEST 2 (Complete)
-- ============================================
INSERT INTO IELTSExam (id, title, type, isFullExam, difficultyLevel, totalQuestions, totalSections, durationMinutes, audioUrl, isPublished, createdAt, updatedAt)
VALUES (2002, '剑桥雅思 20 - Test 2 听力', 'listening', TRUE, 'intermediate', 40, 4, 30, NULL, TRUE, NOW(), NOW());

-- T2 Part 1: Elderly Care Support
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20021, 2002, 1, 'Part 1', 'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20021,1,'fill_blank','Carers can arrange a ______ from their duties',NULL,'break',1,NOW()),
(20021,2,'fill_blank','Practical support includes help with managing ______',NULL,'time',1,NOW()),
(20021,3,'fill_blank','A care worker can help the person to have a ______',NULL,'shower',1,NOW()),
(20021,4,'fill_blank','Financial advice on how to claim back ______',NULL,'money',1,NOW()),
(20021,5,'fill_blank','Support for people with ______ problems',NULL,'memory',1,NOW()),
(20021,6,'fill_blank','Equipment such as special ______ devices to prevent injury',NULL,'lifting',1,NOW()),
(20021,7,'fill_blank','Equipment to reduce the risk of a ______ at home',NULL,'fall',1,NOW()),
(20021,8,'fill_blank','Help with transport, e.g. arranging a ______',NULL,'taxi',1,NOW()),
(20021,9,'fill_blank','Help with financial matters such as ______ claims',NULL,'insurance',1,NOW()),
(20021,10,'fill_blank','Advice on how to reduce ______ levels',NULL,'stress',1,NOW());

-- T2 Part 2: Volunteer Scheme & Festival
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20022, 2002, 2, 'Part 2', 'Questions 11-16: What role does each person have in the volunteer scheme?\nQuestions 17-20: Choose the correct letter, A, B or C.', NOW());

-- Q11-16: Matching (roles)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20022,11,'matching','Steve Wainwright','["A. providing entertainment","B. providing publicity about a council service","C. running a competition","D. giving advice to visitors","E. collecting feedback on events","F. organising parking","G. recruiting new volunteers","H. encouraging cooperation between local organisations","I. helping people find their seats"]','D. giving advice to visitors',1,NOW()),
(20022,12,'matching','Julia Smith','["A. providing entertainment","B. providing publicity about a council service","C. running a competition","D. giving advice to visitors","E. collecting feedback on events","F. organising parking","G. recruiting new volunteers","H. encouraging cooperation between local organisations","I. helping people find their seats"]','I. helping people find their seats',1,NOW()),
(20022,13,'matching','Peter Jackson','["A. providing entertainment","B. providing publicity about a council service","C. running a competition","D. giving advice to visitors","E. collecting feedback on events","F. organising parking","G. recruiting new volunteers","H. encouraging cooperation between local organisations","I. helping people find their seats"]','H. encouraging cooperation between local organisations',1,NOW()),
(20022,14,'matching','Maria Santos','["A. providing entertainment","B. providing publicity about a council service","C. running a competition","D. giving advice to visitors","E. collecting feedback on events","F. organising parking","G. recruiting new volunteers","H. encouraging cooperation between local organisations","I. helping people find their seats"]','E. collecting feedback on events',1,NOW()),
(20022,15,'matching','David Chen','["A. providing entertainment","B. providing publicity about a council service","C. running a competition","D. giving advice to visitors","E. collecting feedback on events","F. organising parking","G. recruiting new volunteers","H. encouraging cooperation between local organisations","I. helping people find their seats"]','A. providing entertainment',1,NOW()),
(20022,16,'matching','Sarah Wilson','["A. providing entertainment","B. providing publicity about a council service","C. running a competition","D. giving advice to visitors","E. collecting feedback on events","F. organising parking","G. recruiting new volunteers","H. encouraging cooperation between local organisations","I. helping people find their seats"]','B. providing publicity about a council service',1,NOW());

-- Q17-20: Multiple choice
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20022,17,'multiple_choice','Which event attracted the largest number of visitors last year?','["A. the music festival","B. the science festival","C. the food festival"]','B. the science festival',1,NOW()),
(20022,18,'multiple_choice','What do volunteers say they gain most from the scheme?','["A. interpersonal skills","B. knowledge of the local area","C. physical fitness"]','A. interpersonal skills',1,NOW()),
(20022,19,'multiple_choice','When is the next training session for new volunteers?','["A. 2 September","B. 9 September","C. 16 September"]','B. 9 September',1,NOW()),
(20022,20,'multiple_choice','What is planned as a reward for volunteers at the end of the year?','["A. a boat trip","B. a dinner","C. a theatre visit"]','A. a boat trip',1,NOW());

-- T2 Part 3: Human Geography Assignment
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20023, 2002, 3, 'Part 3', 'Questions 21-25: What opinion do the students have about each possible topic?\nQuestions 26-30: Choose the correct letter, A, B or C.', NOW());

-- Q21-25: Matching (opinions about topics)
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20023,21,'matching','Tourism','["A. The information given about this was too vague","B. This may not be relevant to their course","C. There is too much information available about this","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. This topic is too broad to cover adequately","G. The information provided about this was interesting"]','D. It will be easy to find facts about this',1,NOW()),
(20023,22,'matching','Sustainable transport','["A. The information given about this was too vague","B. This may not be relevant to their course","C. There is too much information available about this","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. This topic is too broad to cover adequately","G. The information provided about this was interesting"]','G. The information provided about this was interesting',1,NOW()),
(20023,23,'matching','Retail patterns','["A. The information given about this was too vague","B. This may not be relevant to their course","C. There is too much information available about this","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. This topic is too broad to cover adequately","G. The information provided about this was interesting"]','B. This may not be relevant to their course',1,NOW()),
(20023,24,'matching','Green spaces','["A. The information given about this was too vague","B. This may not be relevant to their course","C. There is too much information available about this","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. This topic is too broad to cover adequately","G. The information provided about this was interesting"]','A. The information given about this was too vague',1,NOW()),
(20023,25,'matching','Housing developments','["A. The information given about this was too vague","B. This may not be relevant to their course","C. There is too much information available about this","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. This topic is too broad to cover adequately","G. The information provided about this was interesting"]','E. The facts about this may not be reliable',1,NOW());

-- Q26-30: Multiple choice
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20023,26,'multiple_choice','What do the students choose as the focus of their assignment?','["A. population growth","B. transport systems","C. unemployment"]','C. unemployment',1,NOW()),
(20023,27,'multiple_choice','What type of development do they decide to study?','["A. conference centres","B. shopping malls","C. residential areas"]','A. conference centres',1,NOW()),
(20023,28,'multiple_choice','What is a disadvantage of the type of development they choose?','["A. have unexpected costs","B. create little employment","C. damage the environment"]','A. have unexpected costs',1,NOW()),
(20023,29,'multiple_choice','What positive aspect do they want to investigate?','["A. the creation of new jobs","B. sustainable energy use","C. improved public transport"]','B. sustainable energy use',1,NOW()),
(20023,30,'multiple_choice','What do they decide to find out about the development?','["A. who funded it","B. why it was proposed","C. how much of it has actually been built"]','C. how much of it has actually been built',1,NOW());

-- T2 Part 4: Food Trends
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20024, 2002, 4, 'Part 4', 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 Developing food trends\n## Q35 Case studies', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20024,31,'fill_blank','Avocados: marketing campaign used ______ on social media',NULL,'photos',1,NOW()),
(20024,32,'fill_blank','Oat milk: marketed as a ______ alternative to dairy',NULL,'vegan',1,NOW()),
(20024,33,'fill_blank','Norwegian skrei: promoted by ______ on TV programmes',NULL,'chefs',1,NOW()),
(20024,34,'fill_blank','Norwegian skrei: story covered by food ______',NULL,'journalists',1,NOW()),
(20024,35,'fill_blank','Quinoa: marketed as having numerous ______ benefits',NULL,'health',1,NOW()),
(20024,36,'fill_blank','Kale: promoted by a ______ shop in New York',NULL,'coffee',1,NOW()),
(20024,37,'fill_blank','Quinoa: concerns raised about the impact on the ______ in Bolivia',NULL,'environment',1,NOW()),
(20024,38,'fill_blank','Oat milk: seen as beneficial for a company\'s ______',NULL,'reputation',1,NOW()),
(20024,39,'fill_blank','Quinoa: increased ______ for local people',NULL,'price',1,NOW()),
(20024,40,'fill_blank','Avocados: large amounts needed to grow them can damage the ______',NULL,'soil',1,NOW());

-- ============================================
-- C20 TEST 3 (Complete)
-- ============================================
INSERT INTO IELTSExam (id, title, type, isFullExam, difficultyLevel, totalQuestions, totalSections, durationMinutes, audioUrl, isPublished, createdAt, updatedAt)
VALUES (2003, '剑桥雅思 20 - Test 3 听力', 'listening', TRUE, 'intermediate', 40, 4, 30, NULL, TRUE, NOW(), NOW());

-- T3 Part 1: Furniture Rental Companies
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20031, 2003, 1, 'Part 1', 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20031,1,'fill_blank','Number of furniture rental companies in the UK: ______',NULL,'239',1,NOW()),
(20031,2,'fill_blank','The woman wants furniture that looks ______',NULL,'modern',1,NOW()),
(20031,3,'fill_blank','She needs a new ______ for the living room',NULL,'lamp',1,NOW()),
(20031,4,'fill_blank','Name of the man she speaks to: ______',NULL,'Aaron',1,NOW()),
(20031,5,'fill_blank','Customers must report any ______ within 48 hours',NULL,'damage',1,NOW()),
(20031,6,'fill_blank','Payment can be made by ______ transfer',NULL,'electronic',1,NOW()),
(20031,7,'fill_blank','The company provides free ______ for all rentals',NULL,'insurance',1,NOW()),
(20031,8,'fill_blank','Customers can extend the rental period if they need more ______',NULL,'space',1,NOW()),
(20031,9,'fill_blank','Customers can use a smartphone ______ to manage their rental',NULL,'app',1,NOW()),
(20031,10,'fill_blank','The company allows free ______ within the first week',NULL,'exchanges',1,NOW());

-- T3 Part 2: Bidcaster Archaeological Dig
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20032, 2003, 2, 'Part 2', 'Questions 11-16: Choose the correct letter, A, B or C.\nQuestions 17-20: Label the map below.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20032,11,'multiple_choice','The archaeological dig at Bidcaster was discovered during','["A. road construction","B. building work","C. farming activity"]','B. building work',1,NOW()),
(20032,12,'multiple_choice','The site was originally a','["A. Roman fort","B. medieval village","C. prehistoric settlement"]','A. Roman fort',1,NOW()),
(20032,13,'multiple_choice','What is unusual about the Bidcaster site?','["A. its size","B. its age","C. its location"]','A. its size',1,NOW()),
(20032,14,'multiple_choice','The dig is expected to continue for','["A. six months","B. one year","C. two years"]','C. two years',1,NOW()),
(20032,15,'multiple_choice','Visitors to the site can','["A. watch the archaeologists working","B. participate in the dig","C. see exhibits in a museum"]','B. participate in the dig',1,NOW()),
(20032,16,'multiple_choice','What has been the most interesting find so far?','["A. jewellery","B. pottery","C. tools"]','C. tools',1,NOW()),
(20032,17,'multiple_choice','Where is the entrance to the site?','["A. north side","B. east side","C. south side"]','B. east side',1,NOW()),
(20032,18,'multiple_choice','The car park is located','["A. next to the entrance","B. across the road","C. behind the visitor centre"]','A. next to the entrance',1,NOW()),
(20032,19,'matching','Visitor Centre','["A.","B.","C.","D.","E.","F.","G.","H."]','G',1,NOW()),
(20032,20,'matching','Refreshments','["A.","B.","C.","D.","E.","F.","G.","H."]','E',1,NOW());

-- T3 Part 3: Theatre Programmes Discussion
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20033, 2003, 3, 'Part 3', 'Questions 21-26: Choose the correct letter, A, B or C.\nQuestions 27-30: What does each student suggest about the theatre programme?', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20033,21,'multiple_choice','What does Sarah say about the theatre programme project?','["A. It is the most challenging assignment","B. It is an interesting change from written work","C. It should have been an individual task"]','B. It is an interesting change from written work',1,NOW()),
(20033,22,'multiple_choice','What do the students agree should be on the front cover?','["A. a photograph of the theatre","B. the name of the theatre company","C. an image representing the play"]','A. a photograph of the theatre',1,NOW()),
(20033,23,'multiple_choice','What does James think about the layout?','["A. It should be simple","B. It should be colourful","C. It should follow a traditional design"]','C. It should follow a traditional design',1,NOW()),
(20033,24,'multiple_choice','What information do they decide NOT to include?','["A. biographies of the actors","B. a summary of the plot","C. the history of the theatre"]','A. biographies of the actors',1,NOW()),
(20033,25,'multiple_choice','What do they say about the advertisements?','["A. They are essential to cover costs","B. They should be placed at the back","C. They might distract readers"]','C. They might distract readers',1,NOW()),
(20033,26,'multiple_choice','What final decision do they make?','["A. to use professional printing","B. to ask for feedback from classmates","C. to submit a draft version first"]','B. to ask for feedback from classmates',1,NOW()),
(20033,27,'matching','Including more photographs','["A. recommended by tutor","B. Sarah\'s idea","C. James\'s idea","D. decided against","E. needs more research","F. already completed"]','F. already completed',1,NOW()),
(20033,28,'matching','Adding a director\'s interview','["A. recommended by tutor","B. Sarah\'s idea","C. James\'s idea","D. decided against","E. needs more research","F. already completed"]','E. needs more research',1,NOW()),
(20033,29,'matching','Using a different font','["A. recommended by tutor","B. Sarah\'s idea","C. James\'s idea","D. decided against","E. needs more research","F. already completed"]','B. Sarah\'s idea',1,NOW()),
(20033,30,'matching','Shortening the running time information','["A. recommended by tutor","B. Sarah\'s idea","C. James\'s idea","D. decided against","E. needs more research","F. already completed"]','D. decided against',1,NOW());

-- T3 Part 4: Inclusive Design
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20034, 2003, 4, 'Part 4', 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 Inclusive Design\n## Q36 Practical applications', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20034,31,'fill_blank','Inclusive design goes beyond ______ to meet the needs of all users',NULL,'adaptation',1,NOW()),
(20034,32,'fill_blank','Design must consider people with physical and ______ disabilities',NULL,'cognitive',1,NOW()),
(20034,33,'fill_blank','In classrooms, adjustable ______ allow students of different heights to work comfortably',NULL,'desks',1,NOW()),
(20034,34,'fill_blank','In bathrooms, sensor-operated ______ prevent the spread of germs',NULL,'taps',1,NOW()),
(20034,35,'fill_blank','Using ______ lighting can help people with visual impairments',NULL,'blue',1,NOW()),
(20034,36,'fill_blank','______ recognition technology can assist people with mobility problems',NULL,'voice',1,NOW()),
(20034,37,'fill_blank','Design should consider the needs of ______ women in the workplace',NULL,'pregnant',1,NOW()),
(20034,38,'fill_blank','Poorly designed workstations can cause pain in the neck and ______',NULL,'shoulders',1,NOW()),
(20034,39,'fill_blank','Inclusive design principles have been adopted by the ______ force',NULL,'police',1,NOW()),
(20034,40,'fill_blank','Buildings should maintain a comfortable ______ throughout the year',NULL,'temperature',1,NOW());

-- ============================================
-- C20 TEST 4 (Partial)
-- ============================================
INSERT INTO IELTSExam (id, title, type, isFullExam, difficultyLevel, totalQuestions, totalSections, durationMinutes, audioUrl, isPublished, createdAt, updatedAt)
VALUES (2004, '剑桥雅思 20 - Test 4 听力', 'listening', TRUE, 'intermediate', 40, 4, 30, NULL, TRUE, NOW(), NOW());

-- T4 Part 1: Family Visit Advice
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20041, 2004, 1, 'Part 1', 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20041,1,'fill_blank','Place to stay: ______ Hotel',NULL,'Kings',1,NOW()),
(20041,2,'fill_blank','Cost per night: £ ______',NULL,'125',1,NOW()),
(20041,3,'fill_blank','Recommended activity: ______ tour of the city',NULL,'walking',1,NOW()),
(20041,4,'fill_blank','Alternative activity: a ______ trip on the river',NULL,'boat',1,NOW()),
(20041,5,'fill_blank','Best day to visit the market: ______',NULL,'Tuesday',1,NOW()),
(20041,6,'fill_blank','The market has a good selection of ______ for children',NULL,'space',1,NOW()),
(20041,7,'fill_blank','Restaurant recommendation: they serve excellent ______ food',NULL,'vegetarian',1,NOW()),
(20041,8,'fill_blank','Restaurant opens at ______ p.m.',NULL,'2.30',1,NOW()),
(20041,9,'fill_blank','Train back to the city centre costs ______ p',NULL,'75',1,NOW()),
(20041,10,'fill_blank','Return ferry leaves from the ______',NULL,'port',1,NOW());

-- T4 Part 2: (Topic TBD)
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20042, 2004, 2, 'Part 2', 'Questions 11-16: Choose the correct letter, A, B or C.\nQuestions 17-20: Choose TWO letters, A-E.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20042,11,'multiple_choice','Question 11','["A.","B.","C."]','B',1,NOW()),
(20042,12,'multiple_choice','Question 12','["A.","B.","C."]','A',1,NOW()),
(20042,13,'multiple_choice','Question 13','["A.","B.","C."]','C',1,NOW()),
(20042,14,'multiple_choice','Question 14','["A.","B.","C."]','A',1,NOW()),
(20042,15,'multiple_choice','Question 15','["A.","B.","C."]','B',1,NOW()),
(20042,16,'multiple_choice','Question 16','["A.","B.","C."]','C',1,NOW()),
(20042,17,'multiple_choice','Question 17','["A.","B.","C.","D.","E."]','A',1,NOW()),
(20042,18,'multiple_choice','Question 18','["A.","B.","C.","D.","E."]','C',1,NOW()),
(20042,19,'multiple_choice','Question 19','["A.","B.","C.","D.","E."]','B',1,NOW()),
(20042,20,'multiple_choice','Question 20','["A.","B.","C.","D.","E."]','D',1,NOW());

-- T4 Part 3: (Topic TBD)
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20043, 2004, 3, 'Part 3', 'Questions 21-26: Choose the correct letter, A, B or C.\nQuestions 27-30: Matching.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20043,21,'multiple_choice','Question 21','["A.","B.","C."]','B',1,NOW()),
(20043,22,'multiple_choice','Question 22','["A.","B.","C."]','A',1,NOW()),
(20043,23,'multiple_choice','Question 23','["A.","B.","C."]','C',1,NOW()),
(20043,24,'multiple_choice','Question 24','["A.","B.","C."]','A',1,NOW()),
(20043,25,'multiple_choice','Question 25','["A.","B.","C."]','B',1,NOW()),
(20043,26,'multiple_choice','Question 26','["A.","B.","C."]','C',1,NOW()),
(20043,27,'matching','Item 27','["A.","B.","C.","D.","E.","F."]','D',1,NOW()),
(20043,28,'matching','Item 28','["A.","B.","C.","D.","E.","F."]','A',1,NOW()),
(20043,29,'matching','Item 29','["A.","B.","C.","D.","E.","F."]','F',1,NOW()),
(20043,30,'matching','Item 30','["A.","B.","C.","D.","E.","F."]','B',1,NOW());

-- T4 Part 4: (Topic TBD)
INSERT INTO IELTSExamSection (id, examId, sectionIndex, title, instructions, createdAt) VALUES
(20044, 2004, 4, 'Part 4', 'Complete the notes below. Write ONE WORD ONLY for each answer.', NOW());
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(20044,31,'fill_blank','Question 31','','placeholder',1,NOW()),
(20044,32,'fill_blank','Question 32','','placeholder',1,NOW()),
(20044,33,'fill_blank','Question 33','','placeholder',1,NOW()),
(20044,34,'fill_blank','Question 34','','placeholder',1,NOW()),
(20044,35,'fill_blank','Question 35','','placeholder',1,NOW()),
(20044,36,'fill_blank','Question 36','','placeholder',1,NOW()),
(20044,37,'fill_blank','Question 37','','placeholder',1,NOW()),
(20044,38,'fill_blank','Question 38','','placeholder',1,NOW()),
(20044,39,'fill_blank','Question 39','','placeholder',1,NOW()),
(20044,40,'fill_blank','Question 40','','placeholder',1,NOW());
