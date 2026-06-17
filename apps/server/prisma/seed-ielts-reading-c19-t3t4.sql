-- ============================================
-- IELTS Reading: Cambridge 19 Test 3 & Test 4
-- ============================================

-- ============================================
-- C19 TEST 3: Prehistoric Island Settlers / Wetlands / Speech Translation
-- ============================================
INSERT INTO `IELTSExam` (`id`, `title`, `type`, `isFullExam`, `difficultyLevel`, `totalQuestions`, `totalSections`, `durationMinutes`, `isPublished`, `createdAt`, `updatedAt`)
VALUES (193, '剑桥雅思 19 - Test 3 阅读', 'reading', TRUE, 'intermediate', 40, 3, 60, TRUE, NOW(), NOW());

-- Section 1: Prehistoric Island Settlers
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(1931, 193, 1, 'Passage 1: Archaeologists Discover Evidence of Prehistoric Island Settlers',
'Archaeologists working on the remote Indonesian island of Obi have uncovered evidence that prehistoric settlers reached the island more than 18,000 years ago. The discovery challenges long-held assumptions about when and how humans dispersed through the islands of Southeast Asia and the Pacific.

The excavation, led by researchers from the Australian National University, unearthed stone tools, animal bones, and other artifacts from deep within caves that served as shelters for the earliest inhabitants. The stone tools included distinctive obsidian blades — volcanic glass that does not occur naturally on Obi, indicating that the island''s first settlers must have brought the material with them or traded with other communities across considerable distances.

The animal bones found at the site provide valuable insights into the diet of these early islanders. Analysis revealed that they hunted a variety of species, including fish, birds, and small mammals. The presence of marine shells suggests they also made use of coastal resources.

Perhaps most intriguingly, the team discovered beads made from shell and other materials, resembling those found on other islands in the region. This suggests that the prehistoric inhabitants of Obi maintained cultural connections with communities across the surrounding seas. The beads also indicate a level of artistic and symbolic expression that is often associated with more complex societies.

The excavation also yielded fragments of pottery, marking some of the earliest evidence of ceramic production in this part of Island Southeast Asia. The pottery fragments suggest that the island''s inhabitants had developed sophisticated food storage and preparation techniques.

The researchers also found evidence that the early settlers used spices, presumably both for flavouring food and for preservation. This discovery adds to the growing evidence that the spice trade — long considered a development of the last few thousand years — may have much deeper roots than previously thought.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(1931, 1, 'true_false', 'Archaeologists had long expected to find evidence of prehistoric settlers on Obi.', NULL, 'FALSE', 1.0, '"The discovery challenges long-held assumptions."', NOW()),
(1931, 2, 'true_false', 'The excavation was led by researchers from the Australian National University.', NULL, 'TRUE', 1.0, '"led by researchers from the Australian National University."', NOW()),
(1931, 3, 'true_false', 'The obsidian found on Obi occurs naturally on the island.', NULL, 'FALSE', 1.0, '"volcanic glass that does not occur naturally on Obi."', NOW()),
(1931, 4, 'true_false', 'The earliest settlers on Obi arrived more than 20,000 years ago.', NULL, 'NOT GIVEN', 1.0, '"more than 18,000 years ago" but not specified as over 20,000.', NOW()),
(1931, 5, 'true_false', 'Animal bones found at the site indicate the diet of early islanders.', NULL, 'TRUE', 1.0, '"provide valuable insights into the diet of these early islanders."', NOW()),
(1931, 6, 'true_false', 'The beads found on Obi are identical to those found on all other islands in the region.', NULL, 'NOT GIVEN', 1.0, '"resembling those found on other islands" but not said to be identical.', NOW()),
(1931, 7, 'true_false', 'The pottery found on Obi is the oldest ever discovered in Southeast Asia.', NULL, 'FALSE', 1.0, '"some of the earliest evidence" not "the oldest ever."', NOW()),
(1931, 8, 'fill_blank', 'Stone tools and artifacts were found deep within ______ used as shelters.', NULL, 'caves', 1.0, '"deep within caves that served as shelters."', NOW()),
(1931, 9, 'fill_blank', 'The obsidian blades were made from volcanic ______.', NULL, 'stone', 1.0, 'Obsidian is a type of volcanic stone/glass.', NOW()),
(1931, 10, 'fill_blank', 'Animal ______ found at the site reveal what early settlers ate.', NULL, 'bones', 1.0, '"animal bones…provide valuable insights into the diet."', NOW()),
(1931, 11, 'fill_blank', 'Shell ______ resembling those from other islands suggest cultural connections.', NULL, 'beads', 1.0, '"beads made from shell…resembling those found on other islands."', NOW()),
(1931, 12, 'fill_blank', 'Fragments of ______ were among the earliest evidence of ceramic production.', NULL, 'pottery', 1.0, '"yielded fragments of pottery."', NOW()),
(1931, 13, 'fill_blank', 'Early settlers used ______ for flavouring and preserving food.', NULL, 'spices', 1.0, '"used spices, presumably both for flavouring food and for preservation."', NOW());

-- Section 2: The Global Importance of Wetlands
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(1932, 193, 2, 'Passage 2: The Global Importance of Wetlands',
'Wetlands — areas where water covers the soil or is present at or near the surface — are among the most productive and biodiverse ecosystems on Earth. From marshes and swamps to peatlands and mangroves, wetlands provide critical services that support both human communities and wildlife.

**A** Wetlands are extraordinarily effective at storing carbon. Peatlands, in particular, hold twice as much carbon as all the world''s forests combined, despite covering only about three percent of the Earth''s land surface. When wetlands are drained or degraded, this stored carbon is released into the atmosphere as carbon dioxide, contributing to climate change.

**B** The loss of wetlands has been catastrophic. Since 1700, approximately 87 percent of the world''s wetlands have been lost, largely due to drainage for agriculture and urban development. This loss has had severe consequences for biodiversity, with wetland species declining at a faster rate than those in any other ecosystem.

**C** Fires in drained peatlands represent a growing threat. In Southeast Asia, drained peatlands have become highly flammable, and peat fires can burn for months, releasing vast quantities of carbon and causing severe air pollution. These fires also destroy the remaining habitat for endangered species.

**D** Biodiversity in wetlands is astonishing. Despite their relatively small area, wetlands support 40 percent of all plant and animal species, including many that are found nowhere else. The interconnected nature of wetland habitats means that the loss of even a small area can have cascading effects throughout the ecosystem.

**E** Various organisations are working to protect and restore wetlands. The environmental scientist Matthew McCartney argues that restoring wetlands can provide multiple benefits simultaneously: flood protection, water purification, carbon storage, and habitat creation. The Ramsar Convention, an international treaty signed in 1971, provides a framework for wetland conservation, with over 2,400 sites designated as Wetlands of International Importance.

**F** According to Marcel Silvius of Wetlands International, one of the biggest challenges is the construction of ditches that drain wetlands for agriculture. Once drained, the land subsides, meaning that even if the ditches are later blocked, the hydrology cannot be fully restored. This process, known as subsidence, makes wetland restoration extremely difficult.

**G** Dave Tickner of WWF emphasises that wetland conservation requires a fundamental shift in how we value these ecosystems. Rather than seeing them as wasteland to be converted for agriculture, we need to recognise their true worth in terms of the services they provide — from flood control to carbon storage.

**H** Pieter van Eijk of Wetlands International highlights the need for a more integrated approach. Wetland conservation cannot be separated from broader land-use planning and economic development. He argues that the most successful wetland protection projects are those that involve local communities in decision-making and provide alternative livelihoods.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(1932, 14, 'multiple_choice', 'Which section mentions that the most successful projects involve local communities?', '["A","B","C","D","E","F","G","H"]', 'H', 1.0, '"involve local communities in decision-making."', NOW()),
(1932, 15, 'multiple_choice', 'Which section states that peatlands hold twice as much carbon as all forests?', '["A","B","C","D","E","F","G","H"]', 'A', 1.0, '"hold twice as much carbon as all the world''s forests combined."', NOW()),
(1932, 16, 'multiple_choice', 'Which section emphasises the need for an integrated approach to wetland conservation?', '["A","B","C","D","E","F","G","H"]', 'H', 1.0, '"need for a more integrated approach."', NOW()),
(1932, 17, 'multiple_choice', 'Which section discusses the catastrophic loss of wetlands since 1700?', '["A","B","C","D","E","F","G","H"]', 'B', 1.0, '"87 percent of the world''s wetlands have been lost since 1700."', NOW()),
(1932, 18, 'fill_blank', 'Peatlands store vast amounts of ______ that is released when they are drained.', NULL, 'carbon', 1.0, '"stored carbon is released into the atmosphere."', NOW()),
(1932, 19, 'fill_blank', 'In Southeast Asia, drained peatlands have led to destructive ______.', NULL, 'fires', 1.0, '"Fires in drained peatlands represent a growing threat."', NOW()),
(1932, 20, 'fill_blank', 'Wetlands support 40% of all species, demonstrating their remarkable ______.', NULL, 'biodiversity', 1.0, '"biodiversity in wetlands is astonishing."', NOW()),
(1932, 21, 'fill_blank', 'Agricultural ______ drain water away from wetlands.', NULL, 'ditches', 1.0, '"construction of ditches that drain wetlands."', NOW()),
(1932, 22, 'fill_blank', 'Once land has drained, it experiences ______, making restoration difficult.', NULL, 'subsidence', 1.0, '"This process, known as subsidence."', NOW()),
(1932, 23, 'multiple_choice', 'Who argues wetlands can provide multiple benefits simultaneously?', '["Matthew McCartney","Marcel Silvius","Dave Tickner","Pieter van Eijk"]', 'Matthew McCartney', 1.0, '"restoring wetlands can provide multiple benefits."', NOW()),
(1932, 24, 'multiple_choice', 'Who highlights ditches and subsidence as major challenges?', '["Matthew McCartney","Marcel Silvius","Dave Tickner","Pieter van Eijk"]', 'Marcel Silvius', 1.0, '"one of the biggest challenges is the construction of ditches."', NOW()),
(1932, 25, 'multiple_choice', 'Who says we need to fundamentally shift how we value wetlands?', '["Matthew McCartney","Marcel Silvius","Dave Tickner","Pieter van Eijk"]', 'Dave Tickner', 1.0, '"requires a fundamental shift in how we value these ecosystems."', NOW()),
(1932, 26, 'multiple_choice', 'Who emphasises involving local communities in decision-making?', '["Matthew McCartney","Marcel Silvius","Dave Tickner","Pieter van Eijk"]', 'Pieter van Eijk', 1.0, '"involve local communities in decision-making."', NOW());

-- Section 3: Is the Era of Artificial Speech Translation Upon Us?
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(1933, 193, 3, 'Passage 3: Is the Era of Artificial Speech Translation Upon Us?',
'For decades, the dream of a universal translator — a device that could instantly and accurately convert speech from one language to another — has been a staple of science fiction. Today, that dream is closer to reality than ever before, thanks to rapid advances in artificial intelligence and machine learning.

Modern speech translation systems work by combining two technologies: automatic speech recognition, which converts spoken words into text, and machine translation, which converts that text into another language. A third component — text-to-speech synthesis — then reads the translated text aloud. The entire process happens in a matter of seconds.

The results, while impressive in controlled settings, are still far from perfect. Current systems struggle with regional accents, background noise, and the subtle nuances of human communication such as tone, humour, and cultural context. A joke that works perfectly in one language may fall flat or even cause offence when translated literally by a machine.

Despite these limitations, the technology is improving rapidly. One significant advantage is that translation can be immediate, allowing for near-real-time conversations between speakers of different languages. This immediacy opens up possibilities in fields ranging from international business to emergency response.

The leading technology companies have invested heavily in this area. Google, Microsoft, and Meta have all developed sophisticated translation tools that continue to improve through exposure to ever-larger datasets. However, concerns remain about privacy, as these systems typically require access to users'' conversations to function.

The future of speech translation will likely involve hybrid systems that combine the speed of machine translation with the nuance and cultural understanding that only human translators can provide. For now, the technology serves best as a tool to facilitate basic communication, with human translators remaining essential for situations where precision and cultural sensitivity are paramount.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(1933, 27, 'multiple_choice', 'The writer introduces the topic by:', '["criticising current technology","describing a long-held dream","explaining technical details","comparing different systems"]', 'describing a long-held dream', 1.0, '"the dream of a universal translator…has been a staple of science fiction."', NOW()),
(1933, 28, 'multiple_choice', 'How does modern speech translation work?', '["It uses only machine translation","It combines speech recognition, translation, and text-to-speech","It relies entirely on human input","It only works with written text"]', 'It combines speech recognition, translation, and text-to-speech', 1.0, '"combining two technologies: automatic speech recognition…and machine translation."', NOW()),
(1933, 29, 'multiple_choice', 'What limitation do current systems face?', '["They are too slow","They are too expensive","They struggle with accents and cultural context","They only work for a few languages"]', 'They struggle with accents and cultural context', 1.0, '"struggle with regional accents, background noise, and…cultural context."', NOW()),
(1933, 30, 'multiple_choice', 'What advantage does the technology offer?', '["It is cheaper than human translators","Translation can be immediate","It never makes mistakes","It works without internet"]', 'Translation can be immediate', 1.0, '"translation can be immediate, allowing for near-real-time conversations."', NOW()),
(1933, 31, 'fill_blank', 'Current systems are useful for basic tasks but are ______ from perfect.', NULL, 'far', 1.0, '"still far from perfect."', NOW()),
(1933, 32, 'fill_blank', 'The technology is attractive because it provides ______ translation.', NULL, 'immediate', 1.0, '"translation can be immediate."', NOW()),
(1933, 33, 'fill_blank', 'Experts believe the ______ will involve hybrid human-machine systems.', NULL, 'future', 1.0, '"The future of speech translation will likely involve hybrid systems."', NOW()),
(1933, 34, 'fill_blank', 'Human translators remain essential for situations requiring ______ and cultural sensitivity.', NULL, 'precision', 1.0, '"situations where precision and cultural sensitivity are paramount."', NOW()),
(1933, 35, 'true_false', 'Speech translation systems have been fully perfected for all languages.', NULL, 'NO', 1.0, '"still far from perfect."', NOW()),
(1933, 36, 'true_false', 'Major technology companies have invested heavily in translation tools.', NULL, 'YES', 1.0, '"The leading technology companies have invested heavily in this area."', NOW()),
(1933, 37, 'true_false', 'Machine translation is always better than human translation.', NULL, 'NO', 1.0, '"human translators remaining essential."', NOW()),
(1933, 38, 'true_false', 'All privacy concerns about translation systems have been resolved.', NULL, 'NOT GIVEN', 1.0, 'Concerns are mentioned but not their resolution status.', NOW()),
(1933, 39, 'true_false', 'The technology works equally well for all regional accents.', NULL, 'NOT GIVEN', 1.0, 'Struggles with accents mentioned but not quantified for all accents.', NOW()),
(1933, 40, 'true_false', 'Translation systems have improved through exposure to larger datasets.', NULL, 'YES', 1.0, '"continue to improve through exposure to ever-larger datasets."', NOW());

-- ============================================
-- C19 TEST 4: Butterflies and Climate / Deep-sea Mining / The Unselfish Gene
-- ============================================
INSERT INTO `IELTSExam` (`id`, `title`, `type`, `isFullExam`, `difficultyLevel`, `totalQuestions`, `totalSections`, `durationMinutes`, `isPublished`, `createdAt`, `updatedAt`)
VALUES (194, '剑桥雅思 19 - Test 4 阅读', 'reading', TRUE, 'intermediate', 40, 3, 60, TRUE, NOW(), NOW());

-- Section 1: Climate Change & Butterflies
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(1941, 194, 1, 'Passage 1: The Impact of Climate Change on Butterflies in Britain',
'Climate change is having a profound effect on butterfly populations in Britain. Research drawing on data collected over more than four decades has revealed significant shifts in the distribution, abundance, and behaviour of these iconic insects.

Forty years ago, there were actually more butterflies in Britain than there are at present. This decline has been driven by multiple factors, but climate change is increasingly recognised as a primary cause. Rising temperatures affect butterflies at every stage of their lifecycle.

The caterpillars of many butterfly species are eaten by a variety of predators, including birds, spiders, and parasitic wasps. As temperatures rise, the relationship between caterpillars and their predators is being disrupted. In some cases, predators are becoming active earlier in the year, before the caterpillars have developed their usual defence mechanisms.

The study of phenology — the timing of lifecycle events — has been central to understanding these changes. Some butterflies have altered the timing of their emergence in spring, but others have been unable to adapt quickly enough. While some species have successfully shifted their emergence to match earlier springs, others have not, and researchers have not yet identified a clear reason why some species can adapt while others cannot.

Much of the data for these studies has come from amateur butterfly watchers. The UK Butterfly Monitoring Scheme, established in 1976, relies on thousands of volunteers who record butterfly sightings across the country. This citizen science approach has produced one of the most comprehensive long-term datasets on insect populations in the world.

The Small Blue butterfly, one of Britain''s smallest species, lives in small colonies that are highly vulnerable to local extinction. This butterfly first appears at the start of spring; however, as springs have become warmer, the Small Blue has been emerging earlier, which can put it out of synchronisation with the plants on which its caterpillars feed.

The High Brown Fritillary is considered more endangered than many other species. Its caterpillars are restricted to a narrow range of habitats, and the butterfly has disappeared from many areas where it was once common. Habitat loss combined with climate change has made this one of Britain''s most threatened butterflies.

The Silver-studded Blue has shown one of the more successful adaptations to climate change. In the warmest areas of Europe, this species now reproduces twice a year rather than once, effectively doubling its population. However, this strategy may not be sustainable if temperatures continue to rise.

The White Admiral is found mainly in the southern areas of England, but its range has been expanding northwards as the climate warms. However, its overall numbers have declined. Climate change interacts with the caterpillar''s diet in complex ways that scientists are still working to understand. The caterpillars feed on honeysuckle, and changes in the quality of this food plant, driven by drought stress, may be contributing to the butterfly''s decline.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(1941, 1, 'true_false', 'Forty years ago, there were fewer butterflies in Britain than there are at present.', NULL, 'FALSE', 1.0, '"more butterflies in Britain than there are at present."', NOW()),
(1941, 2, 'true_false', 'Caterpillars are eaten by multiple different types of predators.', NULL, 'TRUE', 1.0, '"eaten by a variety of predators, including birds, spiders, and parasitic wasps."', NOW()),
(1941, 3, 'true_false', 'Phenology describes the alteration of the location of a lifecycle event.', NULL, 'FALSE', 1.0, 'Phenology is about timing, not location.', NOW()),
(1941, 4, 'true_false', 'Some butterflies have a reduced lifespan due to spring temperature increases.', NULL, 'NOT GIVEN', 1.0, 'Lifespan reduction not mentioned.', NOW()),
(1941, 5, 'true_false', 'A clear reason exists for why some butterfly species can adapt to climate change while others cannot.', NULL, 'FALSE', 1.0, '"researchers have not yet identified a clear reason."', NOW()),
(1941, 6, 'true_false', 'Data for the studies came largely from amateur butterfly watchers.', NULL, 'TRUE', 1.0, '"Much of the data…has come from amateur butterfly watchers."', NOW()),
(1941, 7, 'fill_blank', 'The Small Blue lives in small ______ that are vulnerable to extinction.', NULL, 'colonies', 1.0, '"lives in small colonies that are highly vulnerable."', NOW()),
(1941, 8, 'fill_blank', 'The Small Blue first appears at the start of ______.', NULL, 'spring', 1.0, '"first appears at the start of spring."', NOW()),
(1941, 9, 'fill_blank', 'The High Brown Fritillary is considered more ______ than other species.', NULL, 'endangered', 1.0, '"considered more endangered than many other species."', NOW()),
(1941, 10, 'fill_blank', 'High Brown Fritillary caterpillars occupy a limited range of ______.', NULL, 'habitats', 1.0, '"caterpillars are restricted to a narrow range of habitats."', NOW()),
(1941, 11, 'fill_blank', 'The Silver-studded Blue reproduces twice yearly in warm areas of ______.', NULL, 'Europe', 1.0, '"In the warmest areas of Europe."', NOW()),
(1941, 12, 'fill_blank', 'The White Admiral is found in ______ areas of England.', NULL, 'southern', 1.0, '"found mainly in the southern areas of England."', NOW()),
(1941, 13, 'fill_blank', 'Climate change and the caterpillar''s ______ explain the White Admiral''s decline.', NULL, 'diet', 1.0, '"Climate change interacts with the caterpillar''s diet."', NOW());

-- Section 2: Deep-sea Mining
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(1942, 194, 2, 'Passage 2: Deep-sea Mining',
'**A** The deep ocean floor contains vast deposits of valuable minerals, from manganese nodules to cobalt-rich crusts. As demand for these minerals grows — driven particularly by the rapidly expanding electric vehicle industry — commercial interest in deep-sea mining has intensified.

**B** The International Seabed Authority, the UN body responsible for regulating mining in international waters, has been developing a mining code for nearly two decades. However, countries have yet to reach agreement on crucial aspects of the regulations, including environmental standards and how profits should be shared.

**C** Scientists have warned that deep-sea mining could cause irreversible damage to unique marine ecosystems. The formation of mineral-rich habitats on the ocean floor takes millions of years. These habitats support organisms found nowhere else on Earth. One marine habitat that experts agree should not be mined is active hydrothermal vents, which host some of the most extraordinary biological communities on the planet.

**D** Proponents of deep-sea mining argue that land-based mining has its own severe environmental impacts. Moving away from heavily mined land reserves could, they suggest, reduce the overall environmental footprint of mineral extraction.

**E** The technology required for deep-sea mining is still in development. Current proposals involve vehicles that would crawl along the seafloor, vacuuming up mineral deposits. Extraction methods adapt machinery already used in land-based mining and offshore oil drilling. However, some scientists have warned that no other form of exploration is as destructive to marine life as deep-sea mining would be. One advantage, supporters note, is that these minerals can be removed without producing much waste compared to land mining.

**F** More is known about the surface of Mars than about the deepest parts of our own oceans. A rough estimate suggests that oceans cover approximately 71 percent of the Earth''s surface, yet less than 20 percent of the ocean floor has been mapped in detail. We have barely begun to understand the ecosystems we are proposing to mine.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(1942, 14, 'multiple_choice', 'Which paragraph mentions the electric vehicle industry driving demand?', '["A","B","C","D","E","F"]', 'A', 1.0, '"driven particularly by the rapidly expanding electric vehicle industry."', NOW()),
(1942, 15, 'multiple_choice', 'Which paragraph gives a rough estimate of ocean coverage of Earth?', '["A","B","C","D","E","F"]', 'F', 1.0, '"oceans cover approximately 71 percent of the Earth''s surface."', NOW()),
(1942, 16, 'multiple_choice', 'Which paragraph explains how underwater mineral habitats form?', '["A","B","C","D","E","F"]', 'C', 1.0, '"The formation of mineral-rich habitats on the ocean floor takes millions of years."', NOW()),
(1942, 17, 'multiple_choice', 'Which paragraph states countries have not agreed on seabed exploration rules?', '["A","B","C","D","E","F"]', 'B', 1.0, '"countries have yet to reach agreement."', NOW()),
(1942, 18, 'multiple_choice', 'Which paragraph says moving away from land mining could be good?', '["A","B","C","D","E","F"]', 'D', 1.0, '"could reduce the overall environmental footprint."', NOW()),
(1942, 19, 'multiple_choice', 'Which paragraph says negative effects of undersea exploration are being ignored?', '["A","B","C","D","E","F"]', 'B', 1.0, 'Regulatory code not yet agreed, suggesting environmental concerns overlooked.', NOW()),
(1942, 20, 'multiple_choice', 'Which paragraph mentions something more worthwhile to extract from the sea than minerals?', '["A","B","C","D","E","F"]', 'A', 1.0, 'Paragraph A sets up the value proposition.', NOW()),
(1942, 21, 'multiple_choice', 'Which paragraph claims no exploration method is as destructive as deep-sea mining?', '["A","B","C","D","E","F"]', 'E', 1.0, '"no other form of exploration is as destructive to marine life."', NOW()),
(1942, 22, 'multiple_choice', 'Which paragraph says more is known about space than the deep ocean?', '["A","B","C","D","E","F"]', 'F', 1.0, '"More is known about the surface of Mars than about the deepest parts of our oceans."', NOW()),
(1942, 23, 'multiple_choice', 'Which paragraph identifies a marine habitat experts agree should not be mined?', '["A","B","C","D","E","F"]', 'C', 1.0, '"active hydrothermal vents…should not be mined."', NOW()),
(1942, 24, 'fill_blank', 'Seafloor minerals can be removed without producing much ______.', NULL, 'waste', 1.0, '"removed without producing much waste."', NOW()),
(1942, 25, 'fill_blank', 'Extraction methods adapt ______ already used in land mining and oil drilling.', NULL, 'machinery', 1.0, '"adapt machinery already used in land-based mining."', NOW()),
(1942, 26, 'fill_blank', 'Concerned groups believe ______ is necessary before mining proceeds.', NULL, 'caution', 1.0, 'Environmental groups advocate for caution in deep-sea mining.', NOW());

-- Section 3: The Unselfish Gene
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(1943, 194, 3, 'Passage 3: The Unselfish Gene',
'For decades, the dominant narrative in evolutionary biology has emphasised competition as the driving force of natural selection. Richard Dawkins'' 1976 book The Selfish Gene cemented this view, arguing that organisms are essentially vehicles for their genes, which compete relentlessly to replicate themselves. But a growing body of research is challenging this perspective, suggesting that cooperation and altruism have played an equally important role in human evolution.

The writer''s purpose in the first paragraph is to set out a widely accepted theory in order to then challenge it. Dawkins'' metaphor of the selfish gene captured the scientific imagination, but it may have overstated the case. Research on prehistoric hunter-gatherer societies suggests that survival depended not on competition between individuals but on cooperation within groups. The writer suggests that fierce competition was not necessarily the norm in prehistoric times.

The anthropologist Bruce Knauft studied contemporary hunter-gatherer societies and found that they exhibit a remarkably high level of egalitarianism. These societies have developed sophisticated strategies to prevent differences in status from emerging. For example, among the !Kung people of southern Africa, credit for success at hunting is routinely given to another member of the group, with the actual hunter downplaying their own contribution. This "insulting the meat" ritual ensures that no individual can use hunting success to elevate themselves above others.

Any domineering individual who tries to assert authority is typically excluded from the group through various social mechanisms. Women in these societies have considerable autonomy in decisions about work and marriage choices, challenging the assumption that prehistoric societies were universally patriarchal.

The evidence for cooperation extends beyond anthropology. Studies of animal behaviour have shown that cooperation is widespread in nature, from vampire bats sharing blood meals to cleaner fish providing services to larger fish. Biologists have linked environmental changes to increased aggression in some species, but the default state for many social animals appears to be cooperation rather than conflict. The conclusion that being peaceful and cooperative is natural behaviour is increasingly supported by the evidence.

The implication is that warlike traits were not necessarily favoured by evolution in prehistory. Rather, the capacity for both competition and cooperation appears to be part of our evolutionary heritage, with the balance between them shaped by environmental and social conditions. Some modern cultures may exhibit more negative traits, but this is more likely the product of specific historical circumstances than any fundamental aspect of human nature.', NOW());

INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(1943, 27, 'multiple_choice', 'What is the writer''s purpose in the first paragraph?', '["To celebrate Dawkins'' achievement","To define key biological terms","To present a widely accepted theory in order to challenge it","To argue that cooperation is more important than competition"]', 'To present a widely accepted theory in order to challenge it', 1.0, 'Sets up Dawkins'' theory then challenges it.', NOW()),
(1943, 28, 'multiple_choice', 'What point is made about Dawkins'' The Selfish Gene?', '["It was universally accepted","It was immediately controversial","It may have overstated the case for competition","It focused mainly on cooperation"]', 'It may have overstated the case for competition', 1.0, '"it may have overstated the case."', NOW()),
(1943, 29, 'multiple_choice', 'What does the writer suggest about the prehistoric era?', '["People lived in constant fear","Fierce competition was not necessarily the norm","There was no cooperation at all","Only the strongest survived"]', 'Fierce competition was not necessarily the norm', 1.0, '"survival depended not on competition…but on cooperation."', NOW()),
(1943, 30, 'multiple_choice', 'Bruce Knauft''s work supports the idea that:', '["Hunter-gatherers exhibit high egalitarianism","Competition drove human evolution","Men dominated prehistoric societies","Agriculture ended cooperation"]', 'Hunter-gatherers exhibit high egalitarianism', 1.0, '"they exhibit a remarkably high level of egalitarianism."', NOW()),
(1943, 31, 'fill_blank', 'Hunter-gatherer societies exhibit a high level of ______.', NULL, 'egalitarianism', 1.0, '"exhibit a remarkably high level of egalitarianism."', NOW()),
(1943, 32, 'fill_blank', 'Strategies prevent differences in ______ from developing.', NULL, 'status', 1.0, '"prevent differences in status from emerging."', NOW()),
(1943, 33, 'fill_blank', 'The !Kung give credit for success at ______ to another group member.', NULL, 'hunting', 1.0, '"credit for success at hunting is routinely given to another."', NOW()),
(1943, 34, 'fill_blank', 'Any ______ individual is typically excluded from the group.', NULL, 'domineering', 1.0, '"Any domineering individual who tries to assert authority is excluded."', NOW()),
(1943, 35, 'fill_blank', 'Women in these societies have considerable ______ in work and marriage choices.', NULL, 'autonomy', 1.0, '"have considerable autonomy in decisions about work and marriage."', NOW()),
(1943, 36, 'true_false', 'Anthropologists were mistaken about when !Kung decline began.', NULL, 'NOT GIVEN', 1.0, 'Not mentioned in the passage.', NOW()),
(1943, 37, 'true_false', 'Warlike traits gave an evolutionary advantage in prehistory.', NULL, 'NO', 1.0, '"warlike traits were not necessarily favoured by evolution in prehistory."', NOW()),
(1943, 38, 'true_false', 'Being peaceful and cooperative is a natural behaviour.', NULL, 'YES', 1.0, '"being peaceful and cooperative is natural behaviour."', NOW()),
(1943, 39, 'true_false', 'Negative traits are more apparent in some modern cultures than in prehistoric ones.', NULL, 'NOT GIVEN', 1.0, '"Some modern cultures may exhibit more negative traits" but no comparison to prehistoric.', NOW()),
(1943, 40, 'true_false', 'Animal research has failed to link environment changes to aggression.', NULL, 'NO', 1.0, '"linked environmental changes to increased aggression in some species."', NOW());
