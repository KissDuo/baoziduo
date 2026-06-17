-- ============================================
-- IELTS Reading: Cambridge 20 Test 3
-- 3 Passages, 40 Questions, 60 minutes
-- ============================================

INSERT INTO `IELTSExam` (`id`, `title`, `type`, `isFullExam`, `difficultyLevel`, `totalQuestions`, `totalSections`, `durationMinutes`, `isPublished`, `createdAt`, `updatedAt`)
VALUES (30, '剑桥雅思 20 - Test 3 阅读', 'reading', TRUE, 'intermediate', 40, 3, 60, TRUE, NOW(), NOW());

-- ============================================
-- Section 1: Frozen Food (Q1-13)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(310, 30, 1, 'Passage 1: Frozen Food',
'At some point in history, humans discovered that ice preserved food. There is evidence that winter ice was stored to preserve food in the summer as far back as 10,000 years ago. Two thousand years ago, the inhabitants of South America''s Andean mountains had a unique means of conserving potatoes for later consumption. They froze them overnight, then trampled them to squeeze out the moisture, then dried them in the sun. This preserved their nutritional value — if not their aesthetic appeal.

Natural ice remained the main form of refrigeration until late in the 19th century. In the early 1800s, ship owners from Boston, USA, had enormous blocks of Arctic ice towed all over the Atlantic for the purpose of food preservation. In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter from Ogdensburg, New York, to Boston.

In 1870, Australian inventors found a way to make ''mechanical ice'' using a compressor with ammonia and Freon through a condenser. This innovation meant that ice could be produced in any climate. In 1880, a shipment of Australian beef and mutton — two kinds of meat — was sent frozen to England. However, during the freezing process, crystals formed within the cells of the food and burst them, spoiling the flavor and texture of the food. The problem of cell damage during freezing would prove to be a major obstacle.

In 1912, Clarence Birdseye went to Labrador, Canada, to trap and trade furs. During his time there, he observed Inuit fishermen quick-freezing fish in the extremely cold Arctic air. He noticed that the fish frozen quickly at very low temperatures retained their texture and flavor much better than those frozen slowly. Birdseye returned to the United States in 1917 and began developing mechanical freezers based on this principle. His innovations included quick-freezing techniques that reduced crystal damage within food cells. He also introduced cellophane — the first transparent packaging material — which allowed consumers to see the quality of the product before purchasing it. This was a revolutionary development in food marketing.

The frozen food industry received an enormous boost during World War II. Canned goods were rationed to save tin for the production of munitions, making frozen foods more abundant and relatively cheap. By the early 1950s, approximately 33 million US families owned a refrigerator, creating a mass market for frozen products. In 1954, Swanson launched the TV Dinner — a complete frozen meal served in the same segmented aluminum tray that was used by airlines. The product was an instant success, selling over 10 million units in its first year, boosted by a huge advertising budget. Today, the US frozen food industry has a turnover of over $67 billion annually.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(310, 1, 'fill_blank', 'In the Andes, ______ were preserved by freezing and drying 2,000 years ago.', NULL, 'potatoes', 1.0, 'Andean inhabitants froze and dried potatoes.', NOW()),
(310, 2, 'fill_blank', 'In 1851, railroads transported ______ from New York to Boston using insulated cars.', NULL, 'butter', 1.0, '"railroads first began putting blocks of ice in insulated rail cars to send butter."', NOW()),
(310, 3, 'fill_blank', 'In 1880, frozen Australian beef and mutton (two types of ______) were shipped to England.', NULL, 'meat', 1.0, '"beef and mutton (two kinds of meat) was sent frozen."', NOW()),
(310, 4, 'fill_blank', 'Slow freezing caused ______ to form and burst cells, spoiling food.', NULL, 'crystals', 1.0, '"crystals formed within the cells and burst them."', NOW()),
(310, 5, 'fill_blank', 'Birdseye introduced ______, the first transparent packaging material.', NULL, 'cellophane', 1.0, '"He also introduced cellophane — the first transparent packaging material."', NOW()),
(310, 6, 'fill_blank', 'Canned goods were rationed in WWII to save ______ for making weapons.', NULL, 'tin', 1.0, '"Canned goods were rationed to save tin for munitions."', NOW()),
(310, 7, 'fill_blank', 'By the 1950s, 33 million US households owned a ______.', NULL, 'refrigerator', 1.0, '"33 million US families owned a refrigerator."', NOW()),
(310, 8, 'true_false', 'Boston ship owners made a fortune from transporting ice across the Atlantic.', NULL, 'NOT GIVEN', 1.0, 'Text mentions they towed ice but never says whether this made them wealthy.', NOW()),
(310, 9, 'true_false', 'The freezing process used for the 1880 shipment damaged the quality of the food.', NULL, 'TRUE', 1.0, '"spoilt the flavor and texture of the food."', NOW()),
(310, 10, 'true_false', 'Birdseye went to Labrador specifically to study indigenous food preservation methods.', NULL, 'FALSE', 1.0, 'He went "to trap and trade furs" — observing freezing was incidental.', NOW()),
(310, 11, 'true_false', 'Swanson spent a lot of money promoting the TV Dinner.', NULL, 'TRUE', 1.0, 'Launched with "a huge advertising budget."', NOW()),
(310, 12, 'true_false', 'The TV Dinner tray was a completely new design created by Swanson.', NULL, 'FALSE', 1.0, '"the same segmented aluminum tray that was used by airlines."', NOW()),
(310, 13, 'true_false', 'The US frozen food industry has a higher turnover than that of any other country.', NULL, 'NOT GIVEN', 1.0, 'US figure given but never compared to other countries.', NOW());

-- ============================================
-- Section 2: Can the Planet''s Coral Reefs Be Saved? (Q14-26)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(320, 30, 2, 'Passage 2: Can the Planet''s Coral Reefs Be Saved?',
'**A** Conservationists at London Zoo have assembled a giant artificial reef in the "Tiny Giants" gallery, a tank filled with hundreds of corals and tropical fish. The coral reef tank and its magnificent seven-metre-wide window form the exhibition''s core feature. Paul Pearce-Kelly, senior curator at the zoo, explains that the exhibition has two clear educational goals: first, they want to show people how truly wonderful coral reefs are; and second, they want visitors to learn about the research and conservation efforts currently underway to save the world''s reefs from the devastating effects of global warming.

**B** Corals are composed of thousands of tiny soft-bodied animals called polyps that have tentacles for capturing small marine creatures. These polyps get their brilliant colours from algae living inside their tissues. The algae gain protection from being inside the coral, while the photosynthesising they do provides the polyps with essential nutrients. This symbiotic relationship — a remarkable cooperation beneath the waves — has been so successful that coral reefs now cover just 0.1 percent of the ocean floor yet house over 25 percent of all known marine species.

**C** Coral reefs are often called the "rainforests of the sea" because of their extraordinary biodiversity. However, Sir David Attenborough has dismissed this comparison, arguing that coral reefs offer even more visible beauty and wildlife than rainforests, making the phrase inadequate to capture their true magnificence.

**D** Rising ocean temperatures are now triggering increasingly frequent bleaching events — episodes that strip reefs of their vibrant colour and leave them vulnerable to disease and death. Alongside warming seas, scientists have identified multiple other threats: ocean acidification caused by increased CO₂ absorption, sea level rise, pollution by humans, deoxygenation of marine environments, and changes in ocean currents. Without urgent and coordinated action, scientists warn that more than 90 percent of the world''s coral reefs could be lost by 2050.

**E** Scientists at London Zoo are actively working to lessen these problems. Their research focuses on identifying hardy coral species that could survive in warmer, more acidic waters, and developing techniques to artificially increase coral breeding rates through methods such as artificial spawning.

**F** The research is globally networked, with scientists sharing data across international borders. An important part of the mission is promoting hope: by showing the public the progress being made, they aim to "encourage them to believe that we can do something to save the planet''s reefs."', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(320, 14, 'multiple_choice', 'Which heading best matches Section A?', '["The scale of the threat","Cooperation beneath the waves","Working to lessen the problems","Disagreement about a phrase","Two clear educational goals","Promoting hope","A warning of further trouble"]', 'Two clear educational goals', 1.0, '"two clear educational goals": show beauty + research efforts.', NOW()),
(320, 15, 'multiple_choice', 'Which heading best matches Section B?', '["The scale of the threat","Cooperation beneath the waves","Working to lessen the problems","Disagreement about a phrase","Two clear educational goals","Promoting hope","A warning of further trouble"]', 'Cooperation beneath the waves', 1.0, '"This symbiotic relationship — a remarkable cooperation beneath the waves."', NOW()),
(320, 16, 'multiple_choice', 'Which heading best matches Section C?', '["The scale of the threat","Cooperation beneath the waves","Working to lessen the problems","Disagreement about a phrase","Two clear educational goals","Promoting hope","A warning of further trouble"]', 'Disagreement about a phrase', 1.0, 'Attenborough disagrees that "rainforests of the sea" is adequate.', NOW()),
(320, 17, 'multiple_choice', 'Which heading best matches Section D?', '["The scale of the threat","Cooperation beneath the waves","Working to lessen the problems","Disagreement about a phrase","Two clear educational goals","Promoting hope","A warning of further trouble"]', 'A warning of further trouble', 1.0, '"more than 90% could be lost by 2050 without urgent action."', NOW()),
(320, 18, 'multiple_choice', 'Which heading best matches Section E?', '["The scale of the threat","Cooperation beneath the waves","Working to lessen the problems","Disagreement about a phrase","Two clear educational goals","Promoting hope","A warning of further trouble"]', 'Working to lessen the problems', 1.0, '"Scientists ... are actively working to lessen these problems."', NOW()),
(320, 19, 'multiple_choice', 'Which heading best matches Section F?', '["The scale of the threat","Cooperation beneath the waves","Working to lessen the problems","Disagreement about a phrase","Two clear educational goals","Promoting hope","A warning of further trouble"]', 'Promoting hope', 1.0, '"encourage them to believe that we can do something."', NOW());

-- 20-21: Two causes
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(320, 20, 'multiple_choice', 'Which TWO are mentioned as causes of damage to coral reefs?', '["Volcanic eruptions","Overfishing","Contamination from waste","Rising sea levels","Alterations in water currents"]', 'Contamination from waste', 1.0, '"pollution by humans" is one cause.', NOW()),
(320, 21, 'multiple_choice', 'Which TWO are mentioned as causes of damage to coral reefs?', '["Volcanic eruptions","Overfishing","Contamination from waste","Rising sea levels","Alterations in water currents"]', 'Alterations in water currents', 1.0, '"ocean current changes" is one cause.', NOW());

-- 22-23: Two true statements about researchers
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(320, 22, 'multiple_choice', 'Which TWO statements about London Zoo researchers are true?', '["They work only with local species","They identify corals that can cope with warm water","They have built the largest aquarium","They try to speed up coral reproduction","They focus exclusively on funding"]', 'They identify corals that can cope with warm water', 1.0, '"identifying hardy coral species that could survive in warmer, more acidic waters."', NOW()),
(320, 23, 'multiple_choice', 'Which TWO statements about London Zoo researchers are true?', '["They work only with local species","They identify corals that can cope with warm water","They have built the largest aquarium","They try to speed up coral reproduction","They focus exclusively on funding"]', 'They try to speed up coral reproduction', 1.0, '"increase coral breeding rates through artificial spawning."', NOW());

-- 24-26: Sentence Completion
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(320, 24, 'fill_blank', 'Polyps have ______ which they use to catch small marine creatures.', NULL, 'tentacles', 1.0, '"polyps that have tentacles for capturing small marine creatures."', NOW()),
(320, 25, 'fill_blank', 'Inside the coral, algae gain ______.', NULL, 'protection', 1.0, '"The algae gain protection from being inside the coral."', NOW()),
(320, 26, 'fill_blank', 'Rising sea temperatures can strip reefs of their ______.', NULL, 'colour', 1.0, '"bleaching events that strip reefs of their vibrant colour."', NOW());

-- ============================================
-- Section 3: Robots and Us (Q27-40)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(330, 30, 3, 'Passage 3: Robots and Us',
'Three leading experts in their fields — Martin Rees (cosmology/astrophysics), Daniel Wolpert (engineering), and Kathleen Richardson (anthropology) — respond to three key questions about robots and their relationship with humans.

**Should robots be used to colonise other planets?**
Martin Rees believes that by the end of this century, the entire solar system will have been mapped by robotic craft. However, he thinks that mining asteroids for resources is more realistic than "terraforming" planets. Colonised planets should be treated like Antarctica — preserved rather than exploited. Daniel Wolpert does not see a pressing need to colonise other planets; using robots to gather resources nearer to home would be a better use of our robotic tools. Kathleen Richardson argues that the very idea of "colonisation" is morally dubious. We should approach other worlds with genuine interest in "the Other," not impose a particular human model on them.

**How soon will machine intelligence outstrip human intelligence?**
Rees notes that while robots can beat humans at chess, they cannot yet sense their environment like a child. Later this century, sophisticated robots may relate to their surroundings adeptly — which raises important moral questions about whether we would be exploiting them. Wolpert points out that in limited senses — navigation, memory, searching — machine intelligence already outstrips humans. However, visual and speech recognition with human reliability is still far off, and creative intelligence within 50 years is "highly ambitious." Richardson suggests that the fear of machines stems from a human tendency to personify inanimate objects.

**Should we be scared by advances in artificial intelligence?**
Rees worries about the "singularity" — the possibility that computer networks could behave like a single "brain" with goals contrary to human welfare. He argues robots should remain "idiot savants" — very good at specific tasks but without general intelligence. Wolpert acknowledges that we have already seen damaging effects of technology, such as computer viruses, but believes the benefits of computers and robotics will outweigh these misuses. Richardson points out that no robots have actually risen up and challenged human supremacy. She also notes that not everyone fears robots — many people welcome machine intelligence.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(330, 27, 'multiple_choice', 'Which expert believes humans will need to restrict robots'' abilities?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Martin Rees', 1.0, 'Rees: robots should be "idiot savants."', NOW()),
(330, 28, 'multiple_choice', 'Which expert thinks the risk of robots harming us is less than generally believed?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Kathleen Richardson', 1.0, 'Robots have never actually challenged human supremacy.', NOW()),
(330, 29, 'multiple_choice', 'Which expert says it will be many decades before robots are as imaginative as humans?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Daniel Wolpert', 1.0, 'Creative intelligence within 50 years is "highly ambitious."', NOW()),
(330, 30, 'multiple_choice', 'Which expert says we should start considering whether to treat robots fairly?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Martin Rees', 1.0, 'Rees raises moral questions about exploiting robots.', NOW()),
(330, 31, 'multiple_choice', 'Which expert believes robots may help us more on Earth than in space?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Daniel Wolpert', 1.0, '"better use of our robotic tools" nearer to home.', NOW()),
(330, 32, 'multiple_choice', 'Which expert thinks high-quality science fiction may be as accurate as science writing?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Martin Rees', 1.0, 'Rees: first-rate science fiction may not be more likely to be wrong.', NOW()),
(330, 33, 'multiple_choice', 'Which expert notes that some people look forward to greater machine intelligence?', '["Martin Rees","Daniel Wolpert","Kathleen Richardson"]', 'Kathleen Richardson', 1.0, '"many people welcome machine intelligence."', NOW()),
(330, 34, 'multiple_choice', 'Which pair share similar views on an ethical aspect?', '["Rees and Wolpert","Rees and Richardson","Wolpert and Richardson","None share views"]', 'Rees and Richardson', 1.0, 'Both argue against imposing models on other planets.', NOW()),
(330, 35, 'multiple_choice', 'Rees and Wolpert share an opinion about:', '["The threat of AI","The extent of current machine intelligence","The ethics of space colonisation","The role of science fiction"]', 'The extent of current machine intelligence', 1.0, 'Both outline current limitations of AI.', NOW()),
(330, 36, 'multiple_choice', 'Wolpert disagrees with Richardson on:', '["Space colonisation","Whether AI has already caused harm","The speed of AI development","Robot rights"]', 'Whether AI has already caused harm', 1.0, 'Wolpert cites computer viruses; Richardson says none challenged human supremacy.', NOW()),
(330, 37, 'multiple_choice', 'Richardson explains fear of machines as resulting from:', '["Personal experience with robots","Attributing human characteristics to non-human things","Scientific misunderstanding","Media sensationalism"]', 'Attributing human characteristics to non-human things', 1.0, '"human tendency to personify inanimate objects."', NOW()),
(330, 38, 'multiple_choice', 'Rees sees cause for concern in:', '["Robots taking jobs","Robots becoming physically stronger","AI developing independent thought","Space colonisation by robots"]', 'AI developing independent thought', 1.0, 'Networks behaving like a single "brain" with its own goals.', NOW()),
(330, 39, 'multiple_choice', 'Wolpert emphasises that robots are:', '["Too expensive for widespread use","Essential to the science fiction genre","Dangerous if not regulated","Better than humans at most tasks"]', 'Essential to the science fiction genre', 1.0, 'Wolpert on robots and science fiction.', NOW()),
(330, 40, 'multiple_choice', 'Richardson comments on the relationship between:', '["Science and religion","Humans and animals","Reality and fantasy","Work and leisure"]', 'Reality and fantasy', 1.0, 'Richardson on the relationship between reality and fantasy about robots.', NOW());
