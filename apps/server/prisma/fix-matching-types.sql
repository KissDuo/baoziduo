-- Fix matching question types for T1 and T2
-- T1 Part 2: Q16-20 (map labelling) -> matching
UPDATE IELTSQuestion SET questionType = 'matching' WHERE sectionId = 19102 AND questionIndex BETWEEN 16 AND 20;

-- T1 Part 3: Q25-30 (food trends) -> matching
UPDATE IELTSQuestion SET questionType = 'matching' WHERE sectionId = 19103 AND questionIndex BETWEEN 25 AND 30;

-- T2 Part 3: Q25-28 (shoe rejection) -> matching
UPDATE IELTSQuestion SET questionType = 'matching' WHERE sectionId IN (SELECT id FROM IELTSExamSection WHERE examId = 1902 AND sectionIndex = 3) AND questionIndex BETWEEN 25 AND 28;
