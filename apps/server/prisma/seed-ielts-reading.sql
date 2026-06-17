-- ============================================
-- IELTS Reading: Cambridge 20 Test 1
-- 3 Passages, 40 Questions, 60 minutes
-- ============================================

-- Exam
INSERT INTO `IELTSExam` (`id`, `title`, `type`, `isFullExam`, `difficultyLevel`, `totalQuestions`, `totalSections`, `durationMinutes`, `isPublished`, `createdAt`, `updatedAt`)
VALUES (10, '剑桥雅思 20 - Test 1 阅读', 'reading', TRUE, 'intermediate', 40, 3, 60, TRUE, NOW(), NOW());

-- ============================================
-- Section 1: The kākāpō (Questions 1–13)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(100, 10, 1, 'Passage 1: The kākāpō — Night Parrot of the New Zealand Forest',
'The kākāpō, also known as the owl parrot, is a large, forest-dwelling bird, with a pale owl-like face. Up to 64 cm in length, it has predominantly yellow-green feathers, forward-facing eyes, a large grey beak, large blue feet, and relatively short wings and tail. It is the world''s only flightless parrot, and is also possibly one of the world''s longest-living birds, with a reported lifespan of up to 100 years.

Kākāpō are solitary birds and tend to occupy the same home range for many years. They forage on the ground and climb high into trees. They often leap from trees and flap their wings, but at best manage a controlled descent to the ground. They are entirely vegetarian, with their diet including the leaves, roots and bark of trees as well as bulbs, and fern fronds.

Kākāpō breed in summer and autumn, but only in years when food is plentiful. Males play no part in incubation or chick-rearing – females alone incubate eggs and feed the chicks. The 1–4 eggs are laid in soil, which is repeatedly turned over before and during incubation. The female kākāpō has to spend long periods away from the nest searching for food, which leaves the unattended eggs and chicks particularly vulnerable to predators.

Before humans arrived, kākāpō were common throughout New Zealand''s forests. However, this all changed with the arrival of the first Polynesian settlers about 700 years ago. For the early settlers, the flightless kākāpō was easy prey. They ate its meat and used its feathers to make soft cloaks. With them came the Polynesian dog and rat, which also preyed on kākāpō. By the time European colonisers arrived in the early 1800s, kākāpō had become confined to the central North Island and forested parts of the South Island. The fall in kākāpō numbers was accelerated by European colonisation. A great deal of habitat was lost through forest clearance, and introduced species such as deer depleted the remaining forests of food. Other predators such as cats, stoats and two more species of rat were also introduced. The kākāpō were in serious trouble.

In 1894, the New Zealand government launched its first attempt to save the kākāpō. Conservationist Richard Henry led an effort to relocate several hundred of the birds to predator-free Resolution Island in Fiordland. Unfortunately, the island didn''t remain predator free – stoats arrived within six years, eventually destroying the kākāpō population. By the mid-1900s, the kākāpō was practically a lost species. Only a few clung to life in the most isolated parts of New Zealand.

From 1949 to 1973, the newly formed New Zealand Wildlife Service made over 60 expeditions to find kākāpō, focusing mainly on Fiordland. Six were caught, but there were no females amongst them and all but one died within a few months of captivity. In 1974, a new initiative was launched, and by 1977, 18 more kākāpō were found in Fiordland. However, there were still no females. In 1977, a large population of males was spotted in Rakiura – a large island free from stoats, ferrets and weasels. There were about 200 individuals, and in 1980 it was confirmed females were also present. These birds have been the foundation of all subsequent work in managing the species.

Unfortunately, predation by feral cats on Rakiura Island led to a rapid decline in kākāpō numbers. As a result, during 1980–97, the surviving population was evacuated to three island sanctuaries: Codfish Island, Maud Island and Little Barrier Island. However, breeding success was hard to achieve. Rats were found to be a major predator of kākāpō chicks and an insufficient number of chicks survived to offset adult mortality. By 1995, although at least 12 chicks had been produced on the islands, only three had survived. The kākāpō population had dropped to 51 birds. The critical situation prompted an urgent review of kākāpō management in New Zealand.

In 1996, a new Recovery Plan was launched, together with a specialist advisory group called the Kākāpō Scientific and Technical Advisory Committee and a higher amount of funding. Renewed steps were taken to control predators on the three islands. Cats were eradicated from Little Barrier Island in 1980, and possums were eradicated from Codfish Island by 1986. However, the population did not start to increase until rats were removed from all three islands, and the birds were more intensively managed. This involved moving the birds between islands, supplementary feeding of adults and rescuing and hand-raising any failing chicks.

After the first five years of the Recovery Plan, the population was on target. By 2000, five new females had been produced, and the total population had grown to 62 birds. For the first time, there was cautious optimism for the future of kākāpō and by June 2020, a total of 210 birds was recorded.

Today, kākāpō management continues to be guided by the kākāpō Recovery Plan. Its key goals are: minimise the loss of genetic diversity in the kākāpō population, restore or maintain sufficient habitat to accommodate the expected increase in the kākāpō population, and ensure stakeholders continue to be fully engaged in the preservation of the species.',
NOW());

-- Questions 1–6: TRUE/FALSE/NOT GIVEN
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(100, 1, 'true_false', 'There are other parrots that share the kākāpō''s inability to fly.', NULL, 'FALSE', 1.0, 'The passage states it is "the world''s only flightless parrot."', NOW()),
(100, 2, 'true_false', 'Adult kākāpō produce chicks every year.', NULL, 'FALSE', 1.0, 'They breed "only in years when food is plentiful."', NOW()),
(100, 3, 'true_false', 'Adult male kākāpō bring food back to nesting females.', NULL, 'FALSE', 1.0, '"Males play no part in incubation or chick-rearing."', NOW()),
(100, 4, 'true_false', 'The Polynesian rat was a greater threat to the kākāpō than Polynesian settlers.', NULL, 'NOT GIVEN', 1.0, 'Both are mentioned as threats but no comparison of severity is made.', NOW()),
(100, 5, 'true_false', 'Kākāpō were transferred from Rakiura Island to other locations because they were at risk from feral cats.', NULL, 'TRUE', 1.0, 'Predation by feral cats led to evacuation to three island sanctuaries.', NOW()),
(100, 6, 'true_false', 'One Recovery Plan initiative that helped increase the kākāpō population size was caring for struggling young birds.', NULL, 'TRUE', 1.0, '"rescuing and hand-raising any failing chicks" was part of intensive management.', NOW());

-- Questions 7–13: Note Completion (ONE WORD ONLY / AND/OR A NUMBER)
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(100, 7, 'fill_blank', 'The diet of the kākāpō is entirely vegetarian, and includes leaves, roots, bark and ______.', NULL, 'bulbs', 1.0, 'Their diet includes "leaves, roots and bark of trees as well as bulbs."', NOW()),
(100, 8, 'fill_blank', 'The female kākāpō lays 1–4 eggs in ______, which is turned over before and during incubation.', NULL, 'soil', 1.0, 'Eggs are laid in soil which is "repeatedly turned over."', NOW()),
(100, 9, 'fill_blank', 'Polynesian settlers used kākāpō ______ to make soft cloaks.', NULL, 'feathers', 1.0, 'Settlers "used its feathers to make soft cloaks."', NOW()),
(100, 10, 'fill_blank', 'European colonisers introduced animals such as ______ that reduced the kākāpō''s food supply.', NULL, 'deer', 1.0, '"introduced species such as deer depleted the remaining forests of food."', NOW()),
(100, 11, 'fill_blank', 'In ______, it was confirmed that female kākāpō were present on Rakiura Island.', NULL, '1980', 1.0, '"in 1980 it was confirmed females were also present."', NOW()),
(100, 12, 'fill_blank', 'The 1996 Recovery Plan included a higher amount of ______ to support conservation efforts.', NULL, 'funding', 1.0, '"a higher amount of funding" was part of the new Recovery Plan.', NOW()),
(100, 13, 'fill_blank', 'One key goal is to ensure ______ continue to be fully engaged in the preservation of the species.', NULL, 'stakeholders', 1.0, '"ensure stakeholders continue to be fully engaged."', NOW());

-- ============================================
-- Section 2: Return of the Elm (Questions 14–26)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(200, 10, 2, 'Passage 2: Return of the Elm — Reintroducing the Beloved Tree to Britain',
'**A** Around 25 million elms — approximately 90 percent of the UK''s elm population — were wiped out in the 1960s and 1970s by Dutch elm disease. The loss was catastrophic. Matt Elliot, a tree conservationist, notes that just looking at photographs from the 1960s reveals the extraordinary impact of the disease: "They were significant, large trees in the landscape and then they were gone."

**B** Dutch elm disease is caused by a fungus that blocks the tree''s vascular system, essentially preventing water and nutrients from reaching the branches. The disease first appeared in the 1920s but that epidemic eventually faded. The second, more devastating outbreak in the 1960s was triggered by shipments of elm logs from Canada, which carried a far more virulent strain of the fungus. This aggressive form was spread by elm bark beetles and proved lethal to almost all mature elms.

**C** Today, elms survive mainly in low hedgerows where they are regularly cut, preventing the trunk from reaching the 10–15 centimetre diameter that attracts the beetles. However, some mature specimens have mysteriously escaped the epidemic. Karen Russell, a plant scientist, says: "The number of these mature survivors is relatively small, which makes it difficult to research what allowed them to survive. I don''t see how it can be entirely down to luck — there must be a genetic component."

**D** Historically, elm was one of Britain''s most useful and beloved trees. It ran a close second to oak as the country''s preferred hardwood. Its use dates back to the Bronze Age, when it was used to make tools. Later, it was used for shields and swords, and by the 18th century it was widely grown to provide wood for items such as storage crates and flooring. Due to its strength and durability, elm was used in mining equipment and even formed the keel of the 19th-century sailing ship Cutty Sark.

**E** Brighton is a notable exception to the devastation. The city is home to approximately 17,000 elms, one of the largest surviving populations in Europe. Peter Bourne, a local arboriculturist, recalls watching "trees just lose their leaves" as the disease swept through. Brighton''s relative success is partly attributed to its geography — strong sea winds make it difficult for the beetles to fly. However, Bourne warns that "the threat is right on our doorstep" and constant vigilance is required.

**F** Reintroduction efforts are now focused on breeding resistant or tolerant hybrid elms. Seedlings from surviving trees are tested by injecting them with the fungus. Those that show resistance — no symptoms appearing within four to six weeks — are selected for propagation. However, the process is slow and requires careful monitoring over many years.

**G** There is debate about the best approach to reintroduction. Russell questions whether using non-native genetic elements in hybrid breeding matters: "If the tree looks like an elm and functions like an elm, does it really matter if it has some foreign genes?" Elliot takes a different view, warning: "You''re replacing a native species with a horticultural analogue. You''re effectively cloning." The Woodland Trust prefers a more cautious approach, suggesting that surviving native elms should be left to recover naturally where possible.',
NOW());

-- Questions 14–18: Matching Information to Paragraphs
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(200, 14, 'multiple_choice', 'Which paragraph contains a reference to problems caused by the small number of surviving large elms for research purposes?', '["A","B","C","D","E","F","G"]', 'C', 1.0, 'Russell notes few mature survivors makes research difficult.', NOW()),
(200, 15, 'multiple_choice', 'Which paragraph contains a difference of opinion about the value of reintroducing elms?', '["A","B","C","D","E","F","G"]', 'G', 1.0, 'Russell and Elliot debate native vs hybrid reintroduction.', NOW()),
(200, 16, 'multiple_choice', 'Which paragraph contains an explanation of how Dutch elm disease was brought into Britain?', '["A","B","C","D","E","F","G"]', 'B', 1.0, 'Shipments of elm logs from Canada carried the virulent strain.', NOW()),
(200, 17, 'multiple_choice', 'Which paragraph describes the conditions that enable a location to escape the disease?', '["A","B","C","D","E","F","G"]', 'E', 1.0, 'Brighton''s strong sea winds hinder beetles.', NOW()),
(200, 18, 'multiple_choice', 'Which paragraph explains the stage at which young elms become vulnerable?', '["A","B","C","D","E","F","G"]', 'C', 1.0, 'Trunk reaches 10-15 cm diameter attracting beetles.', NOW());

-- Questions 19–23: Matching Statements to People
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(200, 19, 'multiple_choice', 'If a tree gets infected, damage rapidly becomes visible.', '["Matt Elliot","Karen Russell","Peter Bourne"]', 'Karen Russell', 1.0, 'Russell describes returning in 4-6 weeks to see symptoms.', NOW()),
(200, 20, 'multiple_choice', 'Better to wait and see if surviving mature elms continue to flourish.', '["Matt Elliot","Karen Russell","Peter Bourne"]', 'Matt Elliot', 1.0, '"Sometimes the best thing you can do is just give nature time."', NOW()),
(200, 21, 'multiple_choice', 'There must be an explanation for the survival of some mature elms.', '["Matt Elliot","Karen Russell","Peter Bourne"]', 'Karen Russell', 1.0, '"I don''t see how it can be entirely down to luck."', NOW()),
(200, 22, 'multiple_choice', 'Insects carrying the disease are not far away.', '["Matt Elliot","Karen Russell","Peter Bourne"]', 'Peter Bourne', 1.0, '"the threat is right on our doorstep."', NOW()),
(200, 23, 'multiple_choice', 'You understand the disease''s effect by seeing how prominent elm once was.', '["Matt Elliot","Karen Russell","Peter Bourne"]', 'Matt Elliot', 1.0, 'Elliot: "You look at old photographs… then you realise the impact."', NOW());

-- Questions 24–26: Summary Completion (ONE WORD ONLY)
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(200, 24, 'fill_blank', 'For hundreds of years, the only tree that was more popular in Britain than elm was ______.', NULL, 'oak', 1.0, '"elm ran a close second to oak."', NOW()),
(200, 25, 'fill_blank', 'In the 18th century, elm was grown to provide wood for boxes and ______.', NULL, 'flooring', 1.0, '"items such as storage crates and flooring."', NOW()),
(200, 26, 'fill_blank', 'Due to its strength, the Cutty Sark''s ______ was also constructed from elm.', NULL, 'keel', 1.0, '"the keel of the 19th-century sailing ship Cutty Sark."', NOW());

-- ============================================
-- Section 3: How Stress Affects Our Judgement (Questions 27–40)
-- ============================================
INSERT INTO `IELTSExamSection` (`id`, `examId`, `sectionIndex`, `title`, `instructions`, `createdAt`) VALUES
(300, 10, 3, 'Passage 3: How Stress Affects Our Judgement',
'Some of the most important decisions of our lives occur while we''re feeling stressed and anxious. From medical decisions to financial and professional ones, we are all sometimes required to weigh up information under stressful conditions. But do we become better or worse at processing and using information under such circumstances?

My colleague and I, both neuroscientists, wanted to investigate how the mind operates under stress, so we visited some local fire stations. Firefighters'' workdays vary quite a bit. Some are pretty relaxed; they''ll spend their time washing the truck, cleaning equipment, cooking meals and reading. Other days can be hectic, with numerous life-threatening incidents to attend to; they''ll enter burning homes to rescue trapped residents, and assist with medical emergencies. These ups and downs presented the perfect setting for an experiment on how people''s ability to use information changes when they feel under pressure.

We found that perceived threat acted as a trigger for a stress reaction that made the task of processing information easier for the firefighters – but only as long as it conveyed bad news.

This is how we arrived at these results. We asked the firefighters to estimate their likelihood of experiencing 40 different adverse events in their life, such as being involved in an accident or becoming a victim of card fraud. We then gave them either good news (that their likelihood of experiencing these events was lower than they''d thought) or bad news (that it was higher) and asked them to provide new estimates.

People are normally quite optimistic – they will ignore bad news and embrace the good. This is what happened when the firefighters were relaxed; but when they were under stress, a different pattern emerged. Under these conditions, they became hyper-vigilant to bad news, even when it had nothing to do with their job (such as learning that the likelihood of card fraud was higher than they''d thought), and altered their beliefs in response. In contrast, stress didn''t change how they responded to good news (such as learning that the likelihood of card fraud was lower than they''d thought).

Back in our lab, we observed the same pattern in students who were told they had to give a surprise public speech, which would be judged by a panel, recorded and posted online. Sure enough, their cortisol levels spiked, their heart rates went up and they suddenly became better at processing unrelated, yet alarming, information about rates of disease and violence.

When we experience stressful events, a physiological change is triggered that causes us to take in warnings and focus on what might go wrong. Brain imaging reveals that this ''switch'' is related to a sudden boost in a neural signal important for learning, specifically in response to unexpected warning signs, such as faces expressing fear.

Such neural engineering could have helped prehistoric humans to survive. When our ancestors found themselves surrounded by hungry animals, they would have benefited from an increased ability to learn about hazards. In a safe environment, however, it would have been wasteful to be on high alert constantly. So, a neural switch that automatically increases or decreases our ability to process warnings in response to changes in our environment could have been useful. In fact, people with clinical depression and anxiety seem unable to switch away from a state in which they absorb all the negative messages around them.

It is also important to realise that stress travels rapidly from one person to the next. If a co-worker is stressed, we are more likely to tense up and feel stressed ourselves. We don''t even need to be in the same room with someone for their emotions to influence our behaviour. Studies show that if we observe positive feeds on social media, such as images of a pink sunset, we are more likely to post uplifting messages ourselves. If we observe negative posts, such as complaints about a long queue at the coffee shop, we will in turn create more negative posts.

In some ways, many of us now live as if we are in danger, constantly ready to tackle demanding emails and text messages, and respond to news alerts and comments on social media. Repeatedly checking your phone, according to a survey conducted by the American Psychological Association, is related to stress. In other words, a pre-programmed physiological reaction, which evolution has equipped us with to help us avoid famished predators, is now being triggered by an online post. Social media posting, according to one study, raises your pulse, makes you sweat, and enlarges your pupils more than most daily activities.

The fact that stress increases the likelihood that we will focus more on alarming messages, together with the fact that it spreads extremely rapidly, can create collective fear that is not always justified. After a stressful public event, such as a natural disaster or major financial crash, there is often a wave of alarming information in traditional and social media, which individuals become very aware of. But that has the effect of exaggerating existing danger. And so, a reliable pattern emerges – stress is triggered, spreading from one person to the next, which temporarily enhances the likelihood that people will take in negative reports, which increases stress further. As a result, trips are cancelled, even if the disaster took place across the globe; stocks are sold, even when holding on is the best thing to do.

The good news, however, is that positive emotions, such as hope, are contagious too, and are powerful in inducing people to act to find solutions. Being aware of the close relationship between people''s emotional state and how they process information can help us frame our messages more effectively and become conscientious agents of change.',
NOW());

-- Questions 27–30: Multiple Choice
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(300, 27, 'multiple_choice', 'In the first paragraph, the writer introduces the topic of the text by:', '["outlining the main causes of stress in modern life","questioning whether a common assumption is correct","mentioning a challenge faced by everyone","comparing early and recent research into stress"]', 'mentioning a challenge faced by everyone', 1.0, 'The paragraph describes how everyone faces decisions under stress.', NOW()),
(300, 28, 'multiple_choice', 'What point does the writer make about firefighters in the second paragraph?', '["The regular changes of stress levels in their working lives make them ideal study subjects","Many of their routine tasks are more stressful than the public realises","They are often required to process large amounts of information rapidly","The stress they experience at work can have a long-term effect on their health"]', 'The regular changes of stress levels in their working lives make them ideal study subjects', 1.0, '"These ups and downs presented the perfect setting for an experiment."', NOW()),
(300, 29, 'multiple_choice', 'What is the writer doing in the fourth paragraph?', '["evaluating evidence that supports their conclusions","outlining the main findings of their investigation","summarising the views of the firefighters","describing their methodology"]', 'describing their methodology', 1.0, 'The paragraph explains how they asked firefighters about adverse events.', NOW()),
(300, 30, 'multiple_choice', 'In the seventh paragraph, the writer describes a mechanism in the brain which:', '["causes people to ignore negative information","creates long-lasting memories of stressful events","produces heightened sensitivity to indications of external threats","generates an automatic response to most types of danger"]', 'produces heightened sensitivity to indications of external threats', 1.0, '"causes us to take in warnings and focus on what might go wrong."', NOW());

-- Questions 31–35: Sentence Completion (matching endings)
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(300, 31, 'multiple_choice', 'At times when they were relaxed, the firefighters usually —', '["made them feel optimistic","took relatively little notice of bad news","responded to negative and positive information in the same way","were feeling under stress","put them in a stressful situation","behaved in a similar manner, regardless of the circumstances","thought it more likely that they would experience something bad"]', 'took relatively little notice of bad news', 1.0, '"People are normally quite optimistic – they will ignore bad news."', NOW()),
(300, 32, 'multiple_choice', 'The researchers noted that when the firefighters were stressed, they —', '["made them feel optimistic","took relatively little notice of bad news","responded to negative and positive information in the same way","were feeling under stress","put them in a stressful situation","behaved in a similar manner, regardless of the circumstances","thought it more likely that they would experience something bad"]', 'thought it more likely that they would experience something bad', 1.0, '"they became hyper-vigilant to bad news… and altered their beliefs."', NOW()),
(300, 33, 'multiple_choice', 'When the firefighters were told good news, they always —', '["made them feel optimistic","took relatively little notice of bad news","responded to negative and positive information in the same way","were feeling under stress","put them in a stressful situation","behaved in a similar manner, regardless of the circumstances","thought it more likely that they would experience something bad"]', 'behaved in a similar manner, regardless of the circumstances', 1.0, '"stress didn''t change how they responded to good news."', NOW()),
(300, 34, 'multiple_choice', 'The students'' cortisol levels and heart rates were affected when the researchers —', '["made them feel optimistic","took relatively little notice of bad news","responded to negative and positive information in the same way","were feeling under stress","put them in a stressful situation","behaved in a similar manner, regardless of the circumstances","thought it more likely that they would experience something bad"]', 'put them in a stressful situation', 1.0, 'Students were told to give a surprise speech (the stressor).', NOW()),
(300, 35, 'multiple_choice', 'In both experiments, negative information was processed better when the subjects —', '["made them feel optimistic","took relatively little notice of bad news","responded to negative and positive information in the same way","were feeling under stress","put them in a stressful situation","behaved in a similar manner, regardless of the circumstances","thought it more likely that they would experience something bad"]', 'were feeling under stress', 1.0, 'Both experiments showed stress enhanced processing of bad news.', NOW());

-- Questions 36–40: YES / NO / NOT GIVEN
INSERT INTO `IELTSQuestion` (`sectionId`, `questionIndex`, `questionType`, `questionText`, `options`, `correctAnswer`, `score`, `answerExplanation`, `createdAt`) VALUES
(300, 36, 'true_false', 'The tone of the content we post on social media tends to reflect the nature of the posts in our feeds.', NULL, 'YES', 1.0, 'Paragraph 9 confirms positive feeds lead to positive posts and vice versa.', NOW()),
(300, 37, 'true_false', 'Phones have a greater impact on our stress levels than other electronic media devices.', NULL, 'NOT GIVEN', 1.0, 'Paragraph 10 mentions phones are related to stress, but no comparison with other devices.', NOW()),
(300, 38, 'true_false', 'The more we read about a stressful public event on social media, the less able we are to take the information in.', NULL, 'NO', 1.0, 'The opposite is true: we become MORE focused on alarming messages.', NOW()),
(300, 39, 'true_false', 'Stress created by social media posts can lead us to take unnecessary precautions.', NULL, 'YES', 1.0, 'Trips cancelled, stocks sold even when not rational.', NOW()),
(300, 40, 'true_false', 'Our tendency to be affected by other people''s moods can be used in a positive way.', NULL, 'YES', 1.0, 'Final paragraph: positive emotions are powerful in finding solutions.', NOW());
