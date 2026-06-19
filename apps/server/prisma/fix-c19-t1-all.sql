-- ============================================
-- Fix ALL C19 T1 Listening Questions
-- Note: P1+P4 use {QX} markers in instructions for inline blanks
-- ============================================
-- P1: Hinchingbrooke Country Park (Note completion)
-- ============================================
DELETE FROM IELTSQuestion WHERE sectionId = 19101;
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19101, 1, 'fill_blank', 'Area: ______ hectares', NULL, '69', 1.0, NOW()),
(19101, 2, 'fill_blank', 'Wetland: lakes, ponds and a ______', NULL, 'stream', 1.0, NOW()),
(19101, 3, 'fill_blank', 'Science: children look at ______ about plants, etc.', NULL, 'data', 1.0, NOW()),
(19101, 4, 'fill_blank', 'Geography: includes learning to use a ______ and compass', NULL, 'map', 1.0, NOW()),
(19101, 5, 'fill_blank', 'Leisure and tourism: mostly concentrates on the park''s ______', NULL, 'visitors', 1.0, NOW()),
(19101, 6, 'fill_blank', 'Music: children make ______ with natural materials, and experiment with rhythm and speed', NULL, 'sounds', 1.0, NOW()),
(19101, 7, 'fill_blank', 'They give children a feeling of ______ that they may not have elsewhere', NULL, 'freedom', 1.0, NOW()),
(19101, 8, 'fill_blank', 'Children learn new ______ and gain self-confidence', NULL, 'skills', 1.0, NOW()),
(19101, 9, 'fill_blank', 'Cost per child: £ ______', NULL, '4.95', 1.0, NOW()),
(19101, 10, 'fill_blank', 'Adults, such as ______, free', NULL, 'leaders', 1.0, NOW());
UPDATE IELTSExamSection SET instructions = 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.' WHERE id = 19101;

-- ============================================
-- P2: Stanthorpe Twinning + Farley House (MC + Map)
-- ============================================
DELETE FROM IELTSQuestion WHERE sectionId = 19102;
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19102, 11, 'multiple_choice', 'The idea for the Stanthorpe Twinning Association came from', '["a local newspaper","a visit by a group of local people to France","a meeting between two local residents","a project involving local schoolchildren"]', 'a meeting between two local residents', 1.0, NOW()),
(19102, 12, 'multiple_choice', 'What particularly impressed local people who first went to Paris?', '["the quality of the accommodation","the modern architecture","the range of excursions","the efficiency of public transport"]', 'the range of excursions', 1.0, NOW()),
(19102, 13, 'multiple_choice', 'Since the twinning was established, the Association has organised', '["language classes","art exhibitions","theatre trips","sporting events"]', 'theatre trips', 1.0, NOW()),
(19102, 14, 'multiple_choice', 'What problem occurred during a visit by French people to Stanthorpe?', '["The weather was unusually bad","The accommodation was inadequate","An organised activity had to be cancelled","Some visitors became unwell"]', 'An organised activity had to be cancelled', 1.0, NOW()),
(19102, 15, 'multiple_choice', 'To raise funds, the Association intends to hold', '["a concert","a sponsored walk","an auction","a dinner"]', 'a dinner', 1.0, NOW()),
(19102, 16, 'multiple_choice', 'Farm shop', '["A","B","C","D","E","F","G","H"]', 'G', 1.0, NOW()),
(19102, 17, 'multiple_choice', 'Disabled entry', '["A","B","C","D","E","F","G","H"]', 'C', 1.0, NOW()),
(19102, 18, 'multiple_choice', 'Adventure playground', '["A","B","C","D","E","F","G","H"]', 'B', 1.0, NOW()),
(19102, 19, 'multiple_choice', 'Kitchen gardens', '["A","B","C","D","E","F","G","H"]', 'D', 1.0, NOW()),
(19102, 20, 'multiple_choice', 'The Temple of the Four Winds', '["A","B","C","D","E","F","G","H"]', 'A', 1.0, NOW());
UPDATE IELTSExamSection SET instructions = 'Questions 11-15: Choose the correct letter, A, B, C or D.

Questions 16-20: Label the map below. Write the correct letter, A-H, next to Questions 16-20.' WHERE id = 19102;

-- ============================================
-- P3: Bread Reuse + Food Trends (MC + Matching)
-- ============================================
DELETE FROM IELTSQuestion WHERE sectionId = 19103;
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19103, 21, 'multiple_choice', 'Which TWO aspects of their bread reuse project did the students enjoy? A meeting professional bakers B finding a good way to prevent waste C visiting a factory D experimenting with designs and colours E tasting different breads', '["A","B","C","D","E"]', 'B', 1.0, NOW()),
(19103, 22, 'multiple_choice', 'Which TWO aspects of their bread reuse project did the students enjoy? A meeting professional bakers B finding a good way to prevent waste C visiting a factory D experimenting with designs and colours E tasting different breads', '["A","B","C","D","E"]', 'D', 1.0, NOW()),
(19103, 23, 'multiple_choice', 'Which TWO uses of the 3D food sensors did the students suggest? A for use on medical products B in food packaging C for measuring temperature D in sporting equipment E to indicate weight of certain foods', '["A","B","C","D","E"]', 'A', 1.0, NOW()),
(19103, 24, 'multiple_choice', 'Which TWO uses of the 3D food sensors did the students suggest? A for use on medical products B in food packaging C for measuring temperature D in sporting equipment E to indicate weight of certain foods', '["A","B","C","D","E"]', 'E', 1.0, NOW()),
(19103, 25, 'multiple_choice', 'Use of local products', '["A - unnecessary","B - may have disappointing results","C - already seems widespread","D - retailers should do more","E - too expensive","F - most know little about it","G - stricter regulations needed","H - could be dangerous"]', 'D', 1.0, NOW()),
(19103, 26, 'multiple_choice', 'Reduction in unnecessary packaging', '["A - unnecessary","B - may have disappointing results","C - already seems widespread","D - retailers should do more","E - too expensive","F - most know little about it","G - stricter regulations needed","H - could be dangerous"]', 'G', 1.0, NOW()),
(19103, 27, 'multiple_choice', 'Gluten-free and lactose-free food', '["A - unnecessary","B - may have disappointing results","C - already seems widespread","D - retailers should do more","E - too expensive","F - most know little about it","G - stricter regulations needed","H - could be dangerous"]', 'C', 1.0, NOW()),
(19103, 28, 'multiple_choice', 'Use of branded products related to celebrity chefs', '["A - unnecessary","B - may have disappointing results","C - already seems widespread","D - retailers should do more","E - too expensive","F - most know little about it","G - stricter regulations needed","H - could be dangerous"]', 'B', 1.0, NOW()),
(19103, 29, 'multiple_choice', 'Development of ''ghost kitchens'' for takeaway food', '["A - unnecessary","B - may have disappointing results","C - already seems widespread","D - retailers should do more","E - too expensive","F - most know little about it","G - stricter regulations needed","H - could be dangerous"]', 'F', 1.0, NOW()),
(19103, 30, 'multiple_choice', 'Use of mushrooms for common health concerns', '["A - unnecessary","B - may have disappointing results","C - already seems widespread","D - retailers should do more","E - too expensive","F - most know little about it","G - stricter regulations needed","H - could be dangerous"]', 'H', 1.0, NOW());
UPDATE IELTSExamSection SET instructions = 'Questions 21-24: Choose TWO letters, A-E.

Questions 25-30: What opinion do the students express about each of the following food trends? Choose your answers from the box and write the correct letter, A-H, next to Questions 25-30.' WHERE id = 19103;

-- ============================================
-- P4: Ceide Fields (Note completion, ONE WORD ONLY)
-- ============================================
DELETE FROM IELTSQuestion WHERE sectionId = 19104;
INSERT INTO IELTSQuestion (sectionId, questionIndex, questionType, questionText, options, correctAnswer, score, createdAt) VALUES
(19104, 31, 'fill_blank', 'Neolithic farmers built stone ______ to divide their fields', NULL, 'walls', 1.0, NOW()),
(19104, 32, 'fill_blank', 'The site was discovered by a local farmer and his ______', NULL, 'son', 1.0, NOW()),
(19104, 33, 'fill_blank', 'The bog was cut to provide ______ for local people', NULL, 'fuel', 1.0, NOW()),
(19104, 34, 'fill_blank', 'The bog preserved the fields by keeping out ______', NULL, 'oxygen', 1.0, NOW()),
(19104, 35, 'fill_blank', 'The fields were ______ in shape', NULL, 'rectangular', 1.0, NOW()),
(19104, 36, 'fill_blank', 'Evidence of ______ suggests the houses had no windows', NULL, 'lamps', 1.0, NOW()),
(19104, 37, 'fill_blank', 'Each house was occupied by an extended ______', NULL, 'family', 1.0, NOW()),
(19104, 38, 'fill_blank', 'Animals were kept inside during ______', NULL, 'winter', 1.0, NOW()),
(19104, 39, 'fill_blank', 'Climate change made the ______ too wet for farming', NULL, 'soil', 1.0, NOW()),
(19104, 40, 'fill_blank', 'Increased ______ eventually forced farmers to leave the area', NULL, 'rain', 1.0, NOW());
UPDATE IELTSExamSection SET instructions = 'Complete the notes below. Write ONE WORD ONLY for each answer.' WHERE id = 19104;
