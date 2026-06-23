import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  // ===== T3 Reading (exam 30) =====
  const t3s = await p.iELTSExamSection.findMany({ where: { examId: 30 }, orderBy: { sectionIndex: 'asc' } });
  const [t3s1, t3s2, t3s3] = t3s.map(s => s.id);

  // T3 P1 (Frozen Food, pages 89-90)
  const t3p1q17: Record<number, string> = {
    1: '2,000 years ago, South America: People conserved the nutritional value of ______, using a method of freezing then drying.',
    2: '1851, USA: ______ was kept cool by ice during transportation in specially adapted trains.',
    3: '1880, Australia: Two kinds of ______ were the first frozen food shipped to England.',
    4: '1917 onwards, USA: Clarence Birdseye introduced innovations including quick-freezing methods, so that ______ did not spoil the food.',
    5: 'packaging products with ______, so the product was visible.',
    6: 'Early 1940s, USA: Frozen food became popular because of a shortage of ______.',
    7: '1950s, USA: A large number of homes now had a ______.',
  };
  for (const [qi, t] of Object.entries(t3p1q17)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s1, questionIndex: parseInt(qi) }, data: { questionText: t, questionType: 'fill_blank' } });
  }

  const t3p1q813: Record<number, string> = {
    8: 'The ice transportation business made some Boston ship owners very wealthy in the early 1800s.',
    9: 'A disadvantage of the freezing process invented in Australia was that it affected the taste of food.',
    10: 'Clarence Birdseye travelled to Labrador in order to learn how the Inuit people froze fish.',
    11: 'Swanson Foods invested a great deal of money in the promotion of the TV Dinner.',
    12: 'Swanson Foods developed a new style of container for the launch of the TV Dinner.',
    13: 'The US frozen food industry is currently the largest in the world.',
  };
  for (const [qi, t] of Object.entries(t3p1q813)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s1, questionIndex: parseInt(qi) }, data: { questionText: t, questionType: 'true_false' } });
  }
  console.log('T3 P1 done');

  // T3 P2 (Coral, pages 93-95)
  const headings = JSON.stringify(['i. Tried and tested solutions','ii. Cooperation beneath the waves','iii. Working to lessen the problems','iv. Disagreement about the accuracy of a certain phrase','v. Two clear educational goals','vi. Promoting hope','vii. A warning of further trouble ahead']);
  const t3p2q1419: Record<number, [string, string]> = {
    14: ['Section A', 'v. Two clear educational goals'],
    15: ['Section B', 'ii. Cooperation beneath the waves'],
    16: ['Section C', 'iv. Disagreement about the accuracy of a certain phrase'],
    17: ['Section D', 'vii. A warning of further trouble ahead'],
    18: ['Section E', 'iii. Working to lessen the problems'],
    19: ['Section F', 'vi. Promoting hope'],
  };
  for (const [qi, [text, ans]] of Object.entries(t3p2q1419)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s2, questionIndex: parseInt(qi) }, data: { questionText: text, options: headings, questionType: 'matching', correctAnswer: ans } });
  }

  const t3q2021opts = JSON.stringify(['A. a rising number of extreme storms','B. the removal of too many fish from the sea','C. the contamination of the sea from waste','D. increased disease among marine species','E. alterations in the usual flow of water in the seas']);
  const t3q2021text = 'Which TWO of these causes of damage to coral reefs are mentioned by the writer of the text?';
  await p.iELTSQuestion.updateMany({ where: { sectionId: t3s2, questionIndex: 20 }, data: { questionText: t3q2021text, options: t3q2021opts, questionType: 'multiple_choice', correctAnswer: 'C. the contamination of the sea from waste' } });
  await p.iELTSQuestion.updateMany({ where: { sectionId: t3s2, questionIndex: 21 }, data: { questionText: t3q2021text, options: t3q2021opts, questionType: 'multiple_choice', correctAnswer: 'E. alterations in the usual flow of water in the seas' } });

  const t3q2223opts = JSON.stringify(['A. They are hoping to expand the numbers of different corals being bred in laboratories','B. They want to identify corals that can cope well with the changed sea conditions','C. They are looking at ways of creating artificial reefs that corals could grow on','D. They are trying out methods that would speed up reproduction in some corals','E. They are investigating materials that might protect reefs from higher temperatures']);
  const t3q2223text = 'Which TWO of the following statements are true of the researchers at London Zoo?';
  await p.iELTSQuestion.updateMany({ where: { sectionId: t3s2, questionIndex: 22 }, data: { questionText: t3q2223text, options: t3q2223opts, questionType: 'multiple_choice', correctAnswer: 'B. They want to identify corals that can cope well with the changed sea conditions' } });
  await p.iELTSQuestion.updateMany({ where: { sectionId: t3s2, questionIndex: 23 }, data: { questionText: t3q2223text, options: t3q2223opts, questionType: 'multiple_choice', correctAnswer: 'D. They are trying out methods that would speed up reproduction in some corals' } });

  const t3p2q2426: Record<number, string> = {
    24: 'Corals have a number of ______ which they use to collect their food.',
    25: 'Algae gain ______ from being inside the coral.',
    26: 'Increases in the warmth of the sea water can remove the ______ from coral.',
  };
  for (const [qi, t] of Object.entries(t3p2q2426)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s2, questionIndex: parseInt(qi) }, data: { questionText: t, questionType: 'fill_blank' } });
  }
  console.log('T3 P2 done');

  // T3 P3 (Robots/AI, pages 99-101)
  const experts = JSON.stringify(['A. Martin Rees','B. Daniel Wolpert','C. Kathleen Richardson']);
  const t3p3q2733: Record<number, [string, string]> = {
    27: ['For our own safety, humans will need to restrict the abilities of robots.', 'A. Martin Rees'],
    28: ['The risk of robots harming us is less serious than humans believe it to be.', 'C. Kathleen Richardson'],
    29: ['It will take many decades for robot intelligence to be as imaginative as human intelligence.', 'B. Daniel Wolpert'],
    30: ['We may have to start considering whether we are treating robots fairly.', 'A. Martin Rees'],
    31: ['Robots are probably of more help to us on Earth than in space.', 'B. Daniel Wolpert'],
    32: ['The ideas in high-quality science fiction may prove to be just as accurate as those found in the work of mediocre scientists.', 'A. Martin Rees'],
    33: ['There are those who look forward to robots developing greater intelligence.', 'C. Kathleen Richardson'],
  };
  for (const [qi, [text, ans]] of Object.entries(t3p3q2733)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s3, questionIndex: parseInt(qi) }, data: { questionText: text, options: experts, questionType: 'matching', correctAnswer: ans } });
  }

  const endings = JSON.stringify(['A. the harm already done by artificial intelligence','B. advances made in machine intelligence so far','C. changes made to other planets for our own benefit','D. robots to explore outer space']);
  const t3p3q3436: Record<number, [string, string]> = {
    34: ['Richardson and Rees express similar views regarding the ethical aspect of', 'C. changes made to other planets for our own benefit'],
    35: ['Rees and Wolpert share an opinion about the extent of', 'B. advances made in machine intelligence so far'],
    36: ['Wolpert disagrees with Richardson on the question of', 'D. the harm already done by artificial intelligence'],
  };
  for (const [qi, [text, ans]] of Object.entries(t3p3q3436)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s3, questionIndex: parseInt(qi) }, data: { questionText: text, options: endings, questionType: 'matching', correctAnswer: ans } });
  }

  const t3p3q3740 = {
    37: { text: 'What point does Richardson make about fear of machines?', opts: JSON.stringify(['A. It has grown alongside the development of ever more advanced robots.','B. It is the result of our inclination to attribute human characteristics to non-human entities.','C. It has its origins in basic misunderstandings about how inanimate objects function.','D. It demonstrates a key difference between human intelligence and machine intelligence.']), ans: 'B. It is the result of our inclination to attribute human characteristics to non-human entities.' },
    38: { text: 'What does Wolpert say about the singularity?', opts: JSON.stringify(['A. It will happen sooner than most people imagine.','B. It is unlikely to bring many benefits for humans.','C. It would be impossible for robots to achieve.','D. It is not as worrying as some people suggest.']), ans: 'C. It would be impossible for robots to achieve.' },
    39: { text: 'Rees says that some people argue that AI', opts: JSON.stringify(['A. is likely to become too expensive for most businesses.','B. will ultimately work against the best interests of humans.','C. has not yet progressed as far as people would like.','D. could be developed in a way that ensures it remains under human control.']), ans: 'B. will ultimately work against the best interests of humans.' },
    40: { text: 'Richardson says that we should treat robots', opts: JSON.stringify(['A. in the same way that we treat each other.','B. with respect for their superior capabilities.','C. as machines rather than living creatures.','D. as if they had the capacity to think for themselves.']), ans: 'C. as machines rather than living creatures.' },
  };
  for (const [qi, q] of Object.entries(t3p3q3740)) {
    await p.iELTSQuestion.updateMany({ where: { sectionId: t3s3, questionIndex: parseInt(qi) }, data: { questionText: q.text, options: q.opts, questionType: 'multiple_choice', correctAnswer: q.ans } });
  }
  console.log('T3 P3 done');

  await p.$disconnect();
  console.log('T3 Reading complete!');
}
main().catch(e => { console.error(e); process.exit(1); });
