SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM IELTSUserAnswer WHERE attemptId IN (SELECT id FROM (SELECT id FROM IELTSAttempt WHERE examId = 1902) AS t);
DELETE FROM IELTSAttempt WHERE examId = 1902;
DELETE FROM IELTSQuestion WHERE sectionId IN (SELECT id FROM IELTSExamSection WHERE examId = 1902);
DELETE FROM IELTSExamSection WHERE examId = 1902;
DELETE FROM IELTSExam WHERE id = 1902;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO IELTSExam (id,title,type,isFullExam,difficultyLevel,totalQuestions,totalSections,durationMinutes,audioUrl,isPublished,createdAt,updatedAt) VALUES (1902,'剑桥雅思 19 - Test 2 听力','listening',TRUE,'intermediate',40,4,30,NULL,TRUE,NOW(),NOW());

INSERT INTO IELTSExamSection (id,examId,sectionIndex,title,instructions,createdAt) VALUES
(19021,1902,1,'Part 1','Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',NOW()),
(19022,1902,2,'Part 2','Questions 11-16 Choose the correct letter, A, B or C.',NOW()),
(19023,1902,3,'Part 3','Questions 21-24 Choose TWO letters, A-E.',NOW()),
(19024,1902,4,'Part 4','Complete the notes below. Write ONE WORD ONLY for each answer.',NOW());

INSERT INTO IELTSQuestion (sectionId,questionIndex,questionType,questionText,options,correctAnswer,score,createdAt) VALUES
(19021,1,'fill_blank','Surname:',NULL,'Mathieson',1,NOW()),
(19021,2,'fill_blank','The group is aimed mainly at:',NULL,'beginners',1,NOW()),
(19021,3,'fill_blank','The meetings take place at the:',NULL,'college',1,NOW()),
(19021,4,'fill_blank','They are currently learning the:',NULL,'New',1,NOW()),
(19021,5,'fill_blank','Meetings on Saturdays at:',NULL,'11',1,NOW()),
(19021,6,'fill_blank','Each member needs to bring their own:',NULL,'instrument',1,NOW()),
(19021,7,'fill_blank','Beginners mainly learn by:',NULL,'ear',1,NOW()),
(19021,8,'fill_blank','They also do exercises to improve rhythm:',NULL,'clapping',1,NOW()),
(19021,9,'fill_blank','Members can take home a of the sessions:',NULL,'recording',1,NOW()),
(19021,10,'fill_blank','She decides to go and try it before joining:',NULL,'alone',1,NOW());

INSERT INTO IELTSQuestion (sectionId,questionIndex,questionType,questionText,options,correctAnswer,score,createdAt) VALUES
(19022,11,'multiple_choice','The speaker decided to become a lifeboat volunteer because he','["A. was eager to develop a hobby","B. wanted to do something he had always wanted to do","C. was recommended by a friend"]','A. was eager to develop a hobby',1,NOW()),
(19022,12,'multiple_choice','The speaker first learned about the lifeboat service from','["A. a national advertisement","B. a local resident","C. a work colleague"]','B. a local resident',1,NOW()),
(19022,13,'multiple_choice','A medical condition that could prevent someone from volunteering is if they','["A. might be colour blind","B. have a history of back problems","C. have a fear of water"]','A. might be colour blind',1,NOW()),
(19022,14,'multiple_choice','How quickly can the lifeboat be launched?','["A. three to five minutes","B. six to eight minutes","C. ten to twelve minutes"]','B. six to eight minutes',1,NOW()),
(19022,15,'multiple_choice','What does the Operations Manager decide about?','["A. who to include in the crew","B. which training is needed","C. if the lifeboat should be launched"]','C. if the lifeboat should be launched',1,NOW()),
(19022,16,'multiple_choice','As part of community engagement, the speaker','["A. gives talks on safety at sea","B. organises fundraising events","C. trains new volunteers"]','A. gives talks on safety at sea',1,NOW()),
(19022,17,'multiple_choice','Which TWO aspects of the training were the most challenging?','["A. physical fitness tests","B. navigation skills","C. mental strength","D. first aid training","E. wave tank survival techniques"]','C. mental strength',1,NOW()),
(19022,18,'multiple_choice','Which TWO aspects of the training were the most challenging?','["A. physical fitness tests","B. navigation skills","C. mental strength","D. first aid training","E. wave tank survival techniques"]','E. wave tank survival techniques',1,NOW()),
(19022,19,'multiple_choice','Which TWO things does the speaker most enjoy about volunteering?','["A. working as a team","B. winter experiences","C. meeting new people","D. learning technical skills","E. the adrenaline rush"]','A. working as a team',1,NOW()),
(19022,20,'multiple_choice','Which TWO things does the speaker most enjoy about volunteering?','["A. working as a team","B. winter experiences","C. meeting new people","D. learning technical skills","E. the adrenaline rush"]','B. winter experiences',1,NOW());

INSERT INTO IELTSQuestion (sectionId,questionIndex,questionType,questionText,options,correctAnswer,score,createdAt) VALUES
(19023,21,'multiple_choice','Which TWO aspects of their bread reuse project did the students particularly enjoy?','["A. meeting professional bakers","B. finding a good way to prevent waste","C. visiting a factory","D. experimenting with designs and colours","E. tasting different breads"]','B. finding a good way to prevent waste',1,NOW()),
(19023,22,'multiple_choice','Which TWO aspects of their bread reuse project did the students particularly enjoy?','["A. meeting professional bakers","B. finding a good way to prevent waste","C. visiting a factory","D. experimenting with designs and colours","E. tasting different breads"]','D. experimenting with designs and colours',1,NOW()),
(19023,23,'multiple_choice','Which TWO possible uses of the 3D food sensor did the students suggest?','["A. for use on medical products","B. in food packaging","C. for measuring the temperature of food","D. in sporting equipment","E. to indicate the weight of certain foods"]','A. for use on medical products',1,NOW()),
(19023,24,'multiple_choice','Which TWO possible uses of the 3D food sensor did the students suggest?','["A. for use on medical products","B. in food packaging","C. for measuring the temperature of food","D. in sporting equipment","E. to indicate the weight of certain foods"]','E. to indicate the weight of certain foods',1,NOW()),
(19023,25,'matching','high-heeled shoes','["A. one shoe was missing","B. the colour of one shoe had faded","C. one shoe had a hole in it","D. the shoes were of poor quality","E. the shoes were too dirty"]','E. the shoes were too dirty',1,NOW()),
(19023,26,'matching','ankle boots','["A. one shoe was missing","B. the colour of one shoe had faded","C. one shoe had a hole in it","D. the shoes were of poor quality","E. the shoes were too dirty"]','B. the colour of one shoe had faded',1,NOW()),
(19023,27,'matching','baby shoes','["A. one shoe was missing","B. the colour of one shoe had faded","C. one shoe had a hole in it","D. the shoes were of poor quality","E. the shoes were too dirty"]','A. one shoe was missing',1,NOW()),
(19023,28,'matching','trainers','["A. one shoe was missing","B. the colour of one shoe had faded","C. one shoe had a hole in it","D. the shoes were of poor quality","E. the shoes were too dirty"]','C. one shoe had a hole in it',1,NOW()),
(19023,29,'multiple_choice','The students think the research they have done was','["A. limited in scope","B. well organised","C. too ambitious"]','A. limited in scope',1,NOW()),
(19023,30,'multiple_choice','When evaluating recycling schemes, the students focused on','["A. the environmental impact","B. how suitable they are for schools","C. the cost effectiveness"]','B. how suitable they are for schools',1,NOW());

INSERT INTO IELTSQuestion (sectionId,questionIndex,questionType,questionText,options,correctAnswer,score,createdAt) VALUES
(19024,31,'fill_blank','Tardigrades use their legs to ______ rather than swim',NULL,'move',1,NOW()),
(19024,32,'fill_blank','They have a relatively ______ lifespan for such small creatures',NULL,'short',1,NOW()),
(19024,33,'fill_blank','They have structures in their mouths called ______',NULL,'discs',1,NOW()),
(19024,34,'fill_blank','They can survive without ______ for extended periods',NULL,'oxygen',1,NOW()),
(19024,35,'fill_blank','They have a feeding ______ for sucking up nutrients',NULL,'tube',1,NOW()),
(19024,36,'fill_blank','They can survive extreme ______, from very hot to very cold',NULL,'temperatures',1,NOW()),
(19024,37,'fill_blank','They produce a special ______ that protects their cells when drying out',NULL,'protein',1,NOW()),
(19024,38,'fill_blank','Tardigrades have been sent into ______ for scientific experiments',NULL,'space',1,NOW()),
(19024,39,'fill_blank','They are often found living in moss and ______',NULL,'seaweed',1,NOW()),
(19024,40,'fill_blank','Studying them may help protect ______ species from climate change',NULL,'endangered',1,NOW());
