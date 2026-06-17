-- ============================================
-- Seed Data: Articles & Reading Module
-- 测试账号: test@example.com / test123456
-- ============================================
-- 使用方法：选中 en 库后，全选执行
-- ============================================

-- 1. 测试用户
INSERT INTO `User` (`id`, `email`, `passwordHash`, `nickname`, `createdAt`, `updatedAt`) VALUES
(1, 'test@example.com', '$2a$12$QYDDxJNHlJnyhk8PV6BoaeO10EqU4VsDFN5NcSUPa4tXeekh7S6KK', 'TestUser', NOW(), NOW());

-- 2. 单词标注（文章中出现的词，点击即可查释义）
INSERT INTO `WordAnnotation` (`id`, `word`, `phonetic`, `partOfSpeech`, `translation`, `definitionEn`, `exampleSentence`, `createdAt`, `updatedAt`) VALUES
(1,  'climate',       '/ˈklaɪmət/',   'n.', '气候',       'The general weather conditions of a region over time', 'Climate change is one of the biggest challenges of our era.', NOW(), NOW()),
(2,  'emission',      '/iˈmɪʃən/',    'n.', '排放',       'The act of sending out gas, heat, or light', 'Carbon emissions must be reduced to slow global warming.', NOW(), NOW()),
(3,  'renewable',     '/rɪˈnuːəbəl/', 'adj.','可再生的',  'A natural resource that can be used again', 'Solar and wind are examples of renewable energy sources.', NOW(), NOW()),
(4,  'biodiversity',  '/ˌbaɪoʊdaɪˈvɜːrsəti/', 'n.', '生物多样性', 'The variety of plant and animal life', 'The Amazon rainforest is a hotspot of biodiversity.', NOW(), NOW()),
(5,  'sustainable',   '/səˈsteɪnəbəl/','adj.','可持续的', 'Able to be maintained at a certain rate or level', 'Sustainable farming practices protect the soil for future generations.', NOW(), NOW()),
(6,  'negotiation',   '/nɪˌɡoʊʃiˈeɪʃən/','n.','谈判',    'Discussion aimed at reaching an agreement', 'The trade negotiation lasted for several months.', NOW(), NOW()),
(7,  'tariff',        '/ˈtærɪf/',     'n.', '关税',       'A tax on imports or exports', 'The government imposed a 25% tariff on imported steel.', NOW(), NOW()),
(8,  'inflation',     '/ɪnˈfleɪʃən/', 'n.', '通货膨胀',   'A general increase in prices', 'Central banks raised interest rates to combat inflation.', NOW(), NOW()),
(9,  'algorithm',     '/ˈælɡərɪðəm/', 'n.', '算法',      'A process or set of rules for calculations', 'The recommendation algorithm suggests content based on your history.', NOW(), NOW()),
(10, 'breakthrough',  '/ˈbreɪkθruː/', 'n.', '突破',      'An important discovery or development', 'The new drug represents a major breakthrough in cancer treatment.', NOW(), NOW()),
(11, 'ecosystem',     '/ˈiːkoʊsɪstəm/','n.','生态系统',  'A community of living organisms', 'Coral reefs are among the most diverse ecosystems on Earth.', NOW(), NOW()),
(12, 'democracy',     '/dɪˈmɑːkrəsi/','n.', '民主',      'A system of government by the whole population', 'Free elections are the foundation of any democracy.', NOW(), NOW()),
(13, 'legislation',   '/ˌledʒɪˈsleɪʃən/','n.','立法',    'Laws considered collectively', 'New legislation aims to reduce plastic waste by 50%.', NOW(), NOW()),
(14, 'massive',       '/ˈmæsɪv/',     'adj.','巨大的',   'Exceptionally large', 'The project required a massive investment of time and money.', NOW(), NOW()),
(15, 'transition',    '/trænˈzɪʃən/', 'n.', '过渡；转型', 'The process of changing from one state to another', 'The transition to clean energy will take decades.', NOW(), NOW()),
(16, 'diagnosis',     '/ˌdaɪəɡˈnoʊsɪs/','n.','诊断',     'The identification of an illness', 'Early diagnosis is crucial for effective treatment.', NOW(), NOW()),
(17, 'augment',       '/ɔːɡˈment/',   'v.', '增强；扩大', 'To make something greater by adding to it', 'AI can augment human capabilities rather than replace them.', NOW(), NOW()),
(18, 'sovereignty',   '/ˈsɑːvrənti/', 'n.', '主权',      'Supreme power or authority', 'Countries are concerned about their economic sovereignty.', NOW(), NOW()),
(19, 'resilient',     '/rɪˈzɪliənt/', 'adj.','有韧性的', 'Able to recover quickly from difficulties', 'A resilient economy can withstand external shocks.', NOW(), NOW()),
(20, 'fossil fuel',   '/ˈfɑːsəl ˈfjuːəl/','n.','化石燃料','A natural fuel such as coal, oil, or gas', 'Burning fossil fuels releases carbon dioxide into the atmosphere.', NOW(), NOW());

-- ============================================
-- 文章 1：气候与能源 (初级)
-- ============================================
INSERT INTO `Article` (`id`, `title`, `slug`, `source`, `summary`, `content`, `difficultyLevel`, `wordCount`, `estimatedMinutes`, `isPublished`, `publishDate`, `createdAt`, `updatedAt`) VALUES
(1, 'The Global Push for Clean Energy', 'global-push-clean-energy', 'The Guardian',
 'Countries around the world are rapidly shifting toward clean energy sources. This article explores the current trends in renewable energy and what it means for the global climate.',
 'placeholder',
 'beginner', 380, 4, TRUE, '2026-06-10 00:00:00', NOW(), NOW());

INSERT INTO `ArticleParagraph` (`articleId`, `paragraphIndex`, `contentEn`, `contentZh`) VALUES
(1, 1,
 'The world is undergoing a massive transformation in how we produce and consume energy. For decades, coal, oil, and natural gas have powered our economies. But the negative effects of these fossil fuels on the climate have become impossible to ignore.',
 '世界正在经历一场能源生产和消费方式的巨大变革。几十年来，煤炭、石油和天然气一直为我们的经济提供动力。但这些化石燃料对气候的负面影响已经变得不容忽视。'),
(1, 2,
 'Scientists have warned that greenhouse gas emissions must be cut by nearly half by 2030 to avoid the worst impacts of climate change. This has led governments and businesses to invest heavily in renewable energy sources such as solar, wind, and hydropower.',
 '科学家警告说，到 2030 年温室气体排放必须减少近一半，以避免气候变化带来的最严重影响。这促使政府和企业大力投资太阳能、风能和水力等可再生能源。'),
(1, 3,
 'Solar power has seen remarkable growth in the past decade. The cost of solar panels has dropped by over 80 percent, making it cheaper than coal in many parts of the world. China, the United States, and India are leading the way in solar installations.',
 '太阳能在过去十年中取得了显著增长。太阳能电池板的成本下降了 80% 以上，使其在世界许多地方比煤炭更便宜。中国、美国和印度在太阳能安装方面处于领先地位。'),
(1, 4,
 'Wind energy is another key player in the clean energy transition. Offshore wind farms, in particular, have enormous potential. A single offshore turbine can generate enough electricity to power thousands of homes. European countries like Denmark and Germany have been pioneers in this field.',
 '风能是清洁能源转型的另一个关键角色。特别是海上风电场具有巨大的潜力。一台海上涡轮机就可以产生足够数千户家庭使用的电力。丹麦和德国等欧洲国家一直是这一领域的先驱。'),
(1, 5,
 'Despite the progress, challenges remain. Energy storage is still a major hurdle, as solar and wind power are intermittent sources. Batteries are improving, but more innovation is needed. Additionally, many developing nations still rely heavily on coal due to its low cost and availability.',
 '尽管取得了进展，但挑战依然存在。能源储存仍然是一个主要障碍，因为太阳能和风能是间歇性能源。电池在不断改进，但仍需要更多创新。此外，许多发展中国家由于低成本和高可用性，仍然严重依赖煤炭。');

-- ============================================
-- 文章 2：人工智能 (中级)
-- ============================================
INSERT INTO `Article` (`id`, `title`, `slug`, `source`, `summary`, `content`, `difficultyLevel`, `wordCount`, `estimatedMinutes`, `isPublished`, `publishDate`, `createdAt`, `updatedAt`) VALUES
(2, 'How AI is Reshaping the Modern Workplace', 'ai-reshaping-workplace', 'The Economist',
 'Artificial intelligence is no longer a futuristic concept. From automated customer service to advanced data analysis, AI tools are changing how businesses operate and how employees work.',
 'placeholder',
 'intermediate', 520, 6, TRUE, '2026-06-12 00:00:00', NOW(), NOW());

INSERT INTO `ArticleParagraph` (`articleId`, `paragraphIndex`, `contentEn`, `contentZh`) VALUES
(2, 1,
 'Artificial intelligence has moved from science fiction to everyday reality. In the past five years, we have witnessed an explosion of AI-powered tools that are fundamentally changing the nature of work across virtually every industry.',
 '人工智能已经从科幻小说走进了日常现实。在过去五年中，我们见证了人工智能工具的大爆发，它们正在从根本上改变几乎所有行业的工作本质。'),
(2, 2,
 'One of the most visible changes has been in customer service. Chatbots powered by large language models can now handle complex customer inquiries with remarkable accuracy. These systems learn from every interaction, continuously improving their responses over time. This has allowed companies to provide 24/7 support while reducing operational costs.',
 '最明显的变化之一发生在客户服务领域。由大型语言模型驱动的聊天机器人现在能够以惊人的准确性处理复杂的客户咨询。这些系统从每一次互动中学习，随时间推移不断改进响应。这使得公司能够提供全天候支持，同时降低运营成本。'),
(2, 3,
 'In the healthcare sector, AI algorithms are being used to analyze medical images and detect diseases at earlier stages than human doctors can. A recent study showed that an AI system could identify certain types of cancer in CT scans with an accuracy rate of over 94 percent. This represents a significant breakthrough in early diagnosis.',
 '在医疗领域，人工智能算法被用于分析医学影像，并能比人类医生更早地检测出疾病。最近的一项研究表明，一个人工智能系统能够在 CT 扫描中识别出某些类型的癌症，准确率超过 94%。这在早期诊断方面是一个重大突破。'),
(2, 4,
 'However, the rise of AI also raises important questions about the future of employment. While some jobs will inevitably be automated, many experts believe that AI will primarily augment human workers rather than replace them. The key, they argue, is for workers to develop skills that complement AI systems — creativity, critical thinking, and emotional intelligence.',
 '然而，人工智能的兴起也引发了对未来就业的重要问题。虽然一些工作将不可避免地实现自动化，但许多专家认为，人工智能主要是增强而不是取代人类工作者。他们认为，关键在于工作者需要发展补充人工智能系统的技能——创造力、批判性思维和情商。');

-- ============================================
-- 文章 3：全球贸易 (高级) - 部分段落无缓存翻译
-- ============================================
INSERT INTO `Article` (`id`, `title`, `slug`, `source`, `summary`, `content`, `difficultyLevel`, `wordCount`, `estimatedMinutes`, `isPublished`, `publishDate`, `createdAt`, `updatedAt`) VALUES
(3, 'Global Trade Tensions and the Future of Supply Chains', 'global-trade-supply-chains', 'Financial Times',
 'Rising tariffs and geopolitical tensions are forcing multinational corporations to rethink their supply chain strategies. This in-depth analysis examines the long-term implications for global trade.',
 'placeholder',
 'advanced', 680, 8, TRUE, '2026-06-14 00:00:00', NOW(), NOW());

INSERT INTO `ArticleParagraph` (`articleId`, `paragraphIndex`, `contentEn`, `contentZh`) VALUES
(3, 1,
 'The architecture of global trade is undergoing its most significant restructuring since the end of the Cold War. A confluence of factors — rising geopolitical tensions, the lingering effects of the pandemic, and growing concerns about economic sovereignty — has prompted governments and corporations alike to reassess their reliance on distant suppliers and complex international supply chains.',
 '全球贸易架构正在经历自冷战结束以来最重大的重组。地缘政治紧张局势加剧、疫情余波未平、经济主权担忧日益增长等多种因素的叠加，促使政府和企业重新审视其对遥远供应商和复杂国际供应链的依赖。'),
(3, 2,
 'The United States and the European Union have both introduced new tariff regimes targeting Chinese exports, particularly in sectors deemed strategically important such as semiconductors, electric vehicles, and green technology. These protectionist measures, while ostensibly designed to safeguard domestic industries, have triggered retaliatory responses and injected considerable uncertainty into the global trading system.',
 NULL),
(3, 3,
 'In response, multinational corporations are accelerating their efforts to diversify supply chains. The dominant strategy, often referred to as "China plus one," involves maintaining manufacturing operations in China while establishing additional production bases in other Asian countries such as Vietnam, India, and Indonesia. This approach aims to mitigate risk without completely abandoning the cost advantages that China offers.',
 '作为回应，跨国企业正在加速推进供应链多元化。主流策略被称为"中国+1"，即在保持中国制造业务的同时，在越南、印度、印度尼西亚等其他亚洲国家建立额外的生产基地。这种方法旨在降低风险，同时不完全放弃中国提供的成本优势。'),
(3, 4,
 'However, the transition is neither simple nor inexpensive. Building new manufacturing facilities requires significant capital investment, and developing the skilled workforce and supplier networks that make Chinese manufacturing so efficient takes years. In the short term, these restructuring efforts may contribute to higher consumer prices as companies pass along the increased costs of production and logistics.',
 NULL),
(3, 5,
 'Looking ahead, the future of global trade is likely to be characterized by greater regionalization. Rather than a single global marketplace dominated by the lowest-cost producers, we may see the emergence of distinct trading blocs centered around North America, Europe, and Asia. This fragmentation could lead to reduced efficiency but may ultimately create a more resilient global economy.',
 '展望未来，全球贸易的特点很可能是更大程度的区域化。与其说是由成本最低的生产者主导的单一全球市场，我们可能会看到以北美、欧洲和亚洲为中心的明显贸易集团的出现。这种碎片化可能导致效率降低，但最终可能创造一个更具韧性的全球经济。');

-- 4. 会员方案
INSERT INTO `Membership` (`id`, `name`, `slug`, `description`, `priceMonthly`, `priceYearly`, `features`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Free', 'free', 'Basic access with limited features', 0, 0, '["5 articles per month","10 vocabulary words per day","2 paragraph translations per day"]', 1, TRUE, NOW(), NOW()),
(2, 'Pro', 'pro', 'Full access to all features', 29.90, 299.00, '["Unlimited articles","Unlimited vocabulary","AI-powered word analysis","Full paragraph translations","IELTS exam access","No advertisements"]', 2, TRUE, NOW(), NOW()),
(3, 'Premium', 'premium', 'All Pro features plus personalized coaching', 59.90, 599.00, '["Everything in Pro","1-on-1 online tutoring (2h/month)","Personalized study plan","Priority support","Early access to new features"]', 3, TRUE, NOW(), NOW());

-- 5. 词书
INSERT INTO `VocabularyBook` (`id`, `name`, `slug`, `description`, `category`, `totalWords`, `isPublished`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
(1, 'CET-4 核心词汇', 'cet4-core', '大学英语四级考试核心词汇', 'cet4', 0, TRUE, 1, NOW(), NOW()),
(2, 'CET-6 核心词汇', 'cet6-core', '大学英语六级考试核心词汇', 'cet6', 0, TRUE, 2, NOW(), NOW()),
(3, 'IELTS 高频词汇', 'ielts-high-frequency', '雅思考试高频词汇', 'ielts', 0, TRUE, 3, NOW(), NOW());

INSERT INTO `VocabularyWord` (`bookId`, `word`, `phonetic`, `partOfSpeech`, `translation`, `definitionEn`, `exampleSentence`, `wordIndex`) VALUES
(1, 'abandon', '/əˈbændən/', 'v.', '放弃', 'To give up completely', 'They had to abandon the project due to lack of funding.', 1),
(1, 'abstract', '/ˈæbstrækt/', 'adj.', '抽象的', 'Existing in thought rather than matter', 'The concept is too abstract for most people to understand.', 2),
(1, 'academic', '/ˌækəˈdemɪk/', 'adj.', '学术的', 'Relating to education and scholarship', 'She has published several academic papers on climate science.', 3),
(1, 'access', '/ˈækses/', 'n.', '通道；访问', 'The means of approaching or entering', 'Students have free access to the online library.', 4),
(1, 'accompany', '/əˈkʌmpəni/', 'v.', '陪伴', 'To go somewhere with someone', 'He offered to accompany her to the train station.', 5),
(2, 'elaborate', '/ɪˈlæbərət/', 'adj.', '详尽的', 'Detailed and complicated', 'She gave an elaborate explanation of the process.', 1),
(2, 'eloquent', '/ˈeləkwənt/', 'adj.', '有口才的', 'Fluent and persuasive in speaking', 'The lawyer delivered an eloquent defense.', 2),
(2, 'embrace', '/ɪmˈbreɪs/', 'v.', '欣然接受', 'To accept something enthusiastically', 'The company has embraced remote working.', 3),
(3, 'ambiguous', '/æmˈbɪɡjuəs/', 'adj.', '模棱两可的', 'Open to more than one interpretation', 'The contract contains several ambiguous clauses.', 1),
(3, 'comprehensive', '/ˌkɑːmprɪˈhensɪv/', 'adj.', '全面的', 'Including all or nearly all elements', 'We offer a comprehensive range of services.', 2);
