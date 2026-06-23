import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const exam20 = await p.iELTSExamSection.findMany({ where: { examId: 20 }, orderBy: { sectionIndex: 'asc' } });
  const [s1, s2, s3] = exam20.map(s => s.id);

  // ===== T2 P1 (Manatees, pages 50-51) =====
  const p1q16: Record<number, string> = {
    1: 'Manatees — Appearance: look similar to dugongs, but with a differently shaped ______.',
    2: 'Movement: have fewer neck bones than most mammals. need to use their ______ to help to turn their bodies around in order to look sideways.',
    3: 'sense vibrations in the water by means of ______ on their skin.',
    4: 'Feeding: eat mainly aquatic vegetation, such as ______.',
    5: 'grasp and pull up plants with their ______.',
    6: 'Breathing: come to the surface for air every 2-4 minutes when awake and every 15-20 while sleeping. may regulate the ______ of their bodies by using muscles of diaphragm to store air internally.'
  };
  for (const [qi, text] of Object.entries(p1q16)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s1, questionIndex: parseInt(qi) }, data: { questionText: text, questionType: 'fill_blank' } });
  }

  const p1q713: Record<number, string> = {
    7: 'West Indian manatees can be found in a variety of different aquatic habitats.',
    8: 'The Florida manatee lives in warmer waters than the Antillean manatee.',
    9: "The African manatee's range is limited to coastal waters between the West African countries of Mauritania and Angola.",
    10: 'The extent of the loss of Amazonian manatees in the mid-twentieth century was only revealed many years later.',
    11: 'It is predicted that West Indian manatee populations will fall in the coming decades.',
    12: 'The risk to manatees from entanglement and plastic consumption increased significantly in the period 2009-2020.',
    13: 'There is some legislation in place which aims to reduce the likelihood of boat strikes on manatees in Florida.',
  };
  for (const [qi, text] of Object.entries(p1q713)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s1, questionIndex: parseInt(qi) }, data: { questionText: text, questionType: 'true_false' } });
  }
  console.log('T2 P1 fixed');

  // ===== T2 P2 (Procrastination) =====
  const sections = JSON.stringify(['A','B','C','D','E','F','G']);
  const p2q1416: Record<number, string> = {
    14: 'mention of false assumptions about why people procrastinate',
    15: 'reference to the realisation that others also procrastinate',
    16: 'neurological evidence of a link between procrastination and emotion',
  };
  for (const [qi, text] of Object.entries(p2q1416)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s2, questionIndex: parseInt(qi) }, data: { questionText: text, questionType: 'matching', options: sections } });
  }

  const p2q1722: Record<number, string> = {
    17: 'Many people think that procrastination is the result of ______. Others believe it to be the result of an inability to organise time efficiently.',
    18: 'But scientific studies suggest that procrastination is actually due to poor mood management. The tasks we are most likely to put off are those that could damage our self-esteem or cause us to feel ______ when we think about them.',
    19: 'Research comparing chronic procrastinators with other people even found differences in the brain regions associated with regulating emotions and identifying ______.',
    20: 'Emotionally loaded and difficult tasks often cause us to procrastinate. Getting ready to take ______ might be a typical example of one such task.',
    21: 'People who are likely to procrastinate tend to be either ______ or those with low self-esteem.',
    22: "Procrastination is only a short-term measure for managing emotions. It's often followed by a feeling of ______, which worsens our mood and leads to more procrastination.",
  };
  for (const [qi, text] of Object.entries(p2q1722)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s2, questionIndex: parseInt(qi) }, data: { questionText: text, questionType: 'fill_blank' } });
  }

  const q23opts = JSON.stringify(['A. Their salaries are lower','B. The quality of their work is inferior','C. They don\'t keep their jobs for as long','D. They don\'t enjoy their working lives as much','E. They have poorer relationships with colleagues']);
  const q23text = 'Which TWO comparisons between employees who often procrastinate and those who do not are mentioned in the text?';
  await p.iELTSQuestion.updateMany({ where: { sectionId: s2, questionIndex: 23 }, data: { questionText: q23text, options: q23opts, questionType: 'multiple_choice', correctAnswer: 'A. Their salaries are lower' } });
  await p.iELTSQuestion.updateMany({ where: { sectionId: s2, questionIndex: 24 }, data: { questionText: q23text, options: q23opts, questionType: 'multiple_choice', correctAnswer: 'C. They don\'t keep their jobs for as long' } });

  const q25opts = JSON.stringify(['A. not judging ourselves harshly','B. setting ourselves manageable aims','C. rewarding ourselves for tasks achieved','D. prioritising tasks according to their importance','E. avoiding things that stop us concentrating on our tasks']);
  const q25text = 'Which TWO recommendations for getting out of a cycle of procrastination does the writer give?';
  await p.iELTSQuestion.updateMany({ where: { sectionId: s2, questionIndex: 25 }, data: { questionText: q25text, options: q25opts, questionType: 'multiple_choice', correctAnswer: 'A. not judging ourselves harshly' } });
  await p.iELTSQuestion.updateMany({ where: { sectionId: s2, questionIndex: 26 }, data: { questionText: q25text, options: q25opts, questionType: 'multiple_choice', correctAnswer: 'E. avoiding things that stop us concentrating on our tasks' } });
  console.log('T2 P2 fixed');

  // ===== T2 P3 (ABS/Baseball) =====
  const p3q2732: Record<number, string> = {
    27: 'When DeJesus first used ABS, he shared decision-making about strikes with it.',
    28: 'MLB considered it necessary to amend the size of the strike zone when criticisms were received from players.',
    29: "MLB is keen to justify the money spent on improving the accuracy of ABS's calculations.",
    30: 'The hundred-mile-an-hour fastball led to a more exciting style of play.',
    31: "The differing proposals for alterations to the baseball bat led to fierce debate on Sword's team.",
    32: 'ABS makes changes to the shape of the strike zone feasible.',
  };
  for (const [qi, text] of Object.entries(p3q2732)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s3, questionIndex: parseInt(qi) }, data: { questionText: text, questionType: 'true_false' } });
  }

  const sumOpts = JSON.stringify(['A. pitch boundary','B. numerous disputes','C. team tactics','D. subjective assessment','E. widespread approval','F. former roles','G. total silence','H. perceived area']);
  const sumText = 'Even after ABS was developed, MLB still wanted human umpires to shout out decisions as they had in their (33) ______. The umpire\'s job had, at one time, required a (34) ______ about whether a ball was a strike. A ball is considered a strike when the batter does not hit it and it crosses through a (35) ______ extending approximately from the batter\'s knee to his chest. In the past, (36) ______ over strike calls were not uncommon, but today everyone accepts the complete ban on pushing or shoving the umpire. One difference, however, is that during the first game DeJesus used ABS, strike calls were met with (37) ______.';
  const p3q3337ans: Record<number, string> = {
    33: 'F. former roles', 34: 'D. subjective assessment', 35: 'H. perceived area', 36: 'B. numerous disputes', 37: 'G. total silence'
  };
  for (const [qi, ans] of Object.entries(p3q3337ans)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s3, questionIndex: parseInt(qi) }, data: { questionText: sumText, options: sumOpts, questionType: 'matching', correctAnswer: ans } });
  }

  const p3q3840 = {
    38: { text: 'What does the writer suggest about ABS in the fifth paragraph?', opts: JSON.stringify(['A. It is bound to make key decisions that are wrong','B. It may reduce some of the appeal of the game','C. It will lead to the disappearance of human umpires','D. It may increase calls for the rules of baseball to be changed']), ans: 'B. It may reduce some of the appeal of the game' },
    39: { text: 'Morgan Sword says that the introduction of ABS', opts: JSON.stringify(['A. was regarded as an experiment without a guaranteed outcome','B. was intended to keep up with developments in other sports','C. was a response to changing attitudes about the role of sport','D. was an attempt to ensure baseball retained a young audience']), ans: 'D. was an attempt to ensure baseball retained a young audience' },
    40: { text: 'Why does the writer include the views of Noe and Russo?', opts: JSON.stringify(['A. to show that attitudes to technology vary widely','B. to argue that people have unrealistic expectations of sport','C. to indicate that accuracy is not the same thing as enjoyment','D. to suggest that the number of baseball fans needs to increase']), ans: 'C. to indicate that accuracy is not the same thing as enjoyment' },
  };
  for (const [qi, q] of Object.entries(p3q3840)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: s3, questionIndex: parseInt(qi) }, data: { questionText: q.text, options: q.opts, questionType: 'multiple_choice', correctAnswer: q.ans } });
  }
  console.log('T2 P3 fixed');

  await p.$disconnect();
  console.log('T2 Reading complete!');
}
main().catch(e => { console.error(e); process.exit(1); });
