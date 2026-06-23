import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// ============ T3 (from PDF lines 3278-3810) ============
const T3 = {
  sections: [
    {
      id: 20031,
      instructions: 'Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.',
      questions: [
        { qi:1, text:'Peak Rentals: Prices range from $105 to $ ______ per room per month', ans:'239', type:'fill_blank', acc:'["239","two hundred and thirty-nine","two hundred thirty-nine"]' },
        { qi:2, text:'Peak Rentals: The furniture is very ______', ans:'modern', type:'fill_blank' },
        { qi:3, text:'Peak Rentals: Special offer — free ______ with every living room set', ans:'lamp', type:'fill_blank' },
        { qi:4, text:'______ and Oliver: Mid-range prices, 12% monthly fee for ______', ans:'Aaron', type:'fill_blank' },
        { qi:5, text:'Mid-range company: 12% monthly fee for ______', ans:'damage', type:'fill_blank' },
        { qi:6, text:'Larch Furniture Rentals: Offers cheapest prices for renting furniture and ______ items', ans:'electronic', type:'fill_blank' },
        { qi:7, text:'Larch Furniture Rentals: Must have own ______', ans:'insurance', type:'fill_blank' },
        { qi:8, text:'Larch Furniture Rentals: Minimum contract length: six months. Also offers a cleaning service. ______', ans:'space', type:'fill_blank', acc:'["Space"]' },
        { qi:9, text:'Larch Furniture Rentals: See the ______ for the most up-to-date prices', ans:'app', type:'fill_blank' },
        { qi:10, text:'Larch Furniture Rentals: ______ are allowed within 7 days of delivery', ans:'exchanges', type:'fill_blank' },
      ],
    },
    {
      id: 20032,
      instructions: 'Questions 11-16: Choose the correct letter, A, B or C.\nQuestions 17-20: Label the map below. Drag the correct letter, A-G, next to Questions 17-20.',
      questions: [
        { qi:11, text:'Who was responsible for starting the community project?', ans:'B. a national charity', type:'multiple_choice', opts:'["A. the castle owners","B. a national charity","C. the local council"]' },
        { qi:12, text:'How was the gold coin found?', ans:'A. Heavy rain had removed some of the soil', type:'multiple_choice', opts:'["A. Heavy rain had removed some of the soil","B. The ground was dug up by wild rabbits","C. A person with a metal detector searched the area"]' },
        { qi:13, text:'What led the archaeologists to believe there was an ancient village on this site?', ans:'A. the lucky discovery of old records', type:'multiple_choice', opts:'["A. the lucky discovery of old records","B. the bases of several structures visible in the grass","C. the unusual stones found near the castle"]' },
        { qi:14, text:'What are the team still hoping to find?', ans:'C. pieces of jewellery', type:'multiple_choice', opts:'["A. everyday pottery","B. animal bones","C. pieces of jewellery"]' },
        { qi:15, text:'What was found on the other side of the river to the castle?', ans:'B. the outline of fields', type:'multiple_choice', opts:'["A. the remains of a large palace","B. the outline of fields","C. a number of small huts"]' },
        { qi:16, text:'What do the team plan to do after work ends this summer?', ans:'C. start to organise school visits', type:'multiple_choice', opts:'["A. prepare a display for a museum","B. take part in a television programme","C. start to organise school visits"]' },
        { qi:17, text:'bridge foundations', ans:'B', type:'matching', opts:'["A","B","C","D","E","F","G"]' },
        { qi:18, text:'rubbish pit', ans:'A', type:'matching', opts:'["A","B","C","D","E","F","G"]' },
        { qi:19, text:'meeting hall', ans:'G', type:'matching', opts:'["A","B","C","D","E","F","G"]' },
        { qi:20, text:'fish pond', ans:'E', type:'matching', opts:'["A","B","C","D","E","F","G"]' },
      ],
    },
    {
      id: 20033,
      instructions: 'Questions 21-26: Choose the correct letter, A, B or C.\nQuestions 27-30: What comment is made about the programme for each show?',
      questions: [
        { qi:21, text:'Finn was pleased to discover that their topic', ans:'B. had not been chosen by other students', type:'multiple_choice', opts:'["A. was not familiar to their module leader","B. had not been chosen by other students","C. did not prove to be difficult to research"]' },
        { qi:22, text:'Maya says a mistaken belief about theatre programmes is that', ans:'A. theatres pay companies to produce them', type:'multiple_choice', opts:'["A. theatres pay companies to produce them","B. few theatre-goers buy them nowadays","C. they contain far more adverts than previously"]' },
        { qi:23, text:'Finn was surprised that, in early British theatre, programmes', ans:'C. were seen as a kind of contract', type:'multiple_choice', opts:'["A. were difficult for audiences to obtain","B. were given out free of charge","C. were seen as a kind of contract"]' },
        { qi:24, text:'Maya feels their project should include an explanation of why companies of actors', ans:'C. had to tour with their plays', type:'multiple_choice', opts:'["A. promoted their own plays","B. performed plays outdoors","C. had to tour with their plays"]' },
        { qi:25, text:'Finn and Maya both think that, compared to nineteenth-century programmes, those from the eighteenth century', ans:'C. were more informative', type:'multiple_choice', opts:'["A. were more original","B. were more colourful","C. were more informative"]' },
        { qi:26, text:'Maya doesn\'t fully understand why, in the twentieth century,', ans:'B. British theatre programmes failed to develop for so long', type:'multiple_choice', opts:'["A. very few theatre programmes were printed in the USA","B. British theatre programmes failed to develop for so long","C. theatre programmes in Britain copied fashions from the USA"]' },
        { qi:27, text:'Ruy Blas', ans:'F. It resembles an artwork', type:'matching', opts:'["A. Its origin is somewhat controversial","B. It is historically significant for a country","C. It was effective at attracting audiences","D. It is included in a recent project","E. It contains insights into the show","F. It resembles an artwork"]' },
        { qi:28, text:'Man of La Mancha', ans:'E. It contains insights into the show', type:'matching', opts:'["A. Its origin is somewhat controversial","B. It is historically significant for a country","C. It was effective at attracting audiences","D. It is included in a recent project","E. It contains insights into the show","F. It resembles an artwork"]' },
        { qi:29, text:'The Tragedy of Jane Shore', ans:'B. It is historically significant for a country', type:'matching', opts:'["A. Its origin is somewhat controversial","B. It is historically significant for a country","C. It was effective at attracting audiences","D. It is included in a recent project","E. It contains insights into the show","F. It resembles an artwork"]' },
        { qi:30, text:'The Sailors\' Festival', ans:'D. It is included in a recent project', type:'matching', opts:'["A. Its origin is somewhat controversial","B. It is historically significant for a country","C. It was effective at attracting audiences","D. It is included in a recent project","E. It contains insights into the show","F. It resembles an artwork"]' },
      ],
    },
    {
      id: 20034,
      instructions: 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 Definition\n## Q33 Examples of inclusive design\n## Q36 Impact of non-inclusive designs',
      questions: [
        { qi:31, text:'Designing products that can be accessed by a diverse range of people without the need for any ______', ans:'adaptation', type:'fill_blank' },
        { qi:32, text:'Not the same as universal design: that is design for everyone, including catering for people with ______ problems', ans:'cognitive', type:'fill_blank' },
        { qi:33, text:'______ which are adjustable, avoiding back or neck problems', ans:'desks', type:'fill_blank' },
        { qi:34, text:'______ in public toilets which are easier to use', ans:'taps', type:'fill_blank' },
        { qi:35, text:'To assist the elderly: designers avoid using ______ in interfaces', ans:'blue', type:'fill_blank' },
        { qi:36, text:'people can make commands using a mouse, keyboard or their ______', ans:'voice', type:'fill_blank' },
        { qi:37, text:'Seatbelts are especially problematic for ______ women', ans:'pregnant', type:'fill_blank' },
        { qi:38, text:'PPE jackets are often unsuitable because of the size of women\'s ______', ans:'shoulders', type:'fill_blank' },
        { qi:39, text:'PPE for female ______ officers dealing with emergencies is the worst', ans:'police', type:'fill_blank' },
        { qi:40, text:'The ______ in offices is often too low for women', ans:'temperature', type:'fill_blank' },
      ],
    },
  ],
};

// ============ T4 (from PDF lines 4800-4930 + OCR pages) ============
const T4 = {
  sections: [
    {
      id: 20041,
      instructions: 'Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.',
      questions: [
        { qi:1, text:'______ Hotel on George Street', ans:'Kings', type:'fill_blank', acc:'["King\'s"]' },
        { qi:2, text:'cost of family room per night: £ ______ (approx.)', ans:'125', type:'fill_blank', acc:'["125","one hundred and twenty-five","one hundred twenty-five"]' },
        { qi:3, text:'a ______ tour of the city centre (starts in Carlton Square)', ans:'walking', type:'fill_blank' },
        { qi:4, text:'a trip by ______ to the old fort', ans:'boat', type:'fill_blank' },
        { qi:5, text:'Science Museum: best day to visit: ______', ans:'Tuesday', type:'fill_blank' },
        { qi:6, text:'see the exhibition about ______, which opens soon', ans:'space', type:'fill_blank' },
        { qi:7, text:'Clacton Market: good for ______ food', ans:'vegetarian', type:'fill_blank' },
        { qi:8, text:'need to have lunch before ______ p.m.', ans:'2.30', type:'fill_blank', acc:'["2.30","2:30","two thirty"]' },
        { qi:9, text:'save up to ______ % on ticket prices at bargaintickets.com', ans:'75', type:'fill_blank', acc:'["75","seventy-five"]' },
        { qi:10, text:'Blakewell Gardens: climb Telegraph Hill to see a view of the ______', ans:'port', type:'fill_blank' },
      ],
    },
    {
      id: 20042,
      instructions: 'Questions 11-12: Choose TWO letters, A-E.\nQuestions 13-14: Choose TWO letters, A-E.\nQuestions 15-20: Which event in the history of football in the UK took place in each year? Choose SIX answers from the box, A-H.',
      questions: [
        { qi:11, text:'Which TWO things does the speaker say about visiting the football stadium with children?', ans:'B. There is a competition for children today', type:'multiple_choice', opts:'["A. Children can get their photo taken with a football player","B. There is a competition for children today","C. Parents must stay with their children at all times","D. Children will need sunhats and drinks","E. The cafe has a special offer on meals for children"]' },
        { qi:12, text:'Which TWO things does the speaker say about visiting the football stadium with children?', ans:'C. Parents must stay with their children at all times', type:'multiple_choice', opts:'["A. Children can get their photo taken with a football player","B. There is a competition for children today","C. Parents must stay with their children at all times","D. Children will need sunhats and drinks","E. The cafe has a special offer on meals for children"]' },
        { qi:13, text:'Which TWO features of the stadium tour are new this year?', ans:'A. VIP tour', type:'multiple_choice', opts:'["A. VIP tour","B. 360 cinema experience","C. audio guide","D. dressing room tour","E. tours in other languages"]' },
        { qi:14, text:'Which TWO features of the stadium tour are new this year?', ans:'C. audio guide', type:'multiple_choice', opts:'["A. VIP tour","B. 360 cinema experience","C. audio guide","D. dressing room tour","E. tours in other languages"]' },
        { qi:15, text:'1870', ans:'D. the introduction of goalkeepers', type:'matching', opts:'["A. The introduction of pay for the players","B. a change to the design of the goal","C. the first use of lights for matches","D. the introduction of goalkeepers","E. the first international match","F. two changes to the rules of the game","G. the introduction of a fee for spectators","H. an agreement on the length of a game"]' },
        { qi:16, text:'1874', ans:'F. two changes to the rules of the game', type:'matching', opts:'["A. The introduction of pay for the players","B. a change to the design of the goal","C. the first use of lights for matches","D. the introduction of goalkeepers","E. the first international match","F. two changes to the rules of the game","G. the introduction of a fee for spectators","H. an agreement on the length of a game"]' },
        { qi:17, text:'1875', ans:'B. a change to the design of the goal', type:'matching', opts:'["A. The introduction of pay for the players","B. a change to the design of the goal","C. the first use of lights for matches","D. the introduction of goalkeepers","E. the first international match","F. two changes to the rules of the game","G. the introduction of a fee for spectators","H. an agreement on the length of a game"]' },
        { qi:18, text:'1877', ans:'H. an agreement on the length of a game', type:'matching', opts:'["A. The introduction of pay for the players","B. a change to the design of the goal","C. the first use of lights for matches","D. the introduction of goalkeepers","E. the first international match","F. two changes to the rules of the game","G. the introduction of a fee for spectators","H. an agreement on the length of a game"]' },
        { qi:19, text:'1878', ans:'C. the first use of lights for matches', type:'matching', opts:'["A. The introduction of pay for the players","B. a change to the design of the goal","C. the first use of lights for matches","D. the introduction of goalkeepers","E. the first international match","F. two changes to the rules of the game","G. the introduction of a fee for spectators","H. an agreement on the length of a game"]' },
        { qi:20, text:'1880', ans:'G. the introduction of a fee for spectators', type:'matching', opts:'["A. The introduction of pay for the players","B. a change to the design of the goal","C. the first use of lights for matches","D. the introduction of goalkeepers","E. the first international match","F. two changes to the rules of the game","G. the introduction of a fee for spectators","H. an agreement on the length of a game"]' },
      ],
    },
    {
      id: 20043,
      instructions: 'Questions 21-22: Choose TWO letters, A-E.\nQuestions 23-24: Choose TWO letters, A-E.\nQuestions 25-30: Choose the correct letter, A, B or C.',
      questions: [
        { qi:21, text:'Which TWO benefits for children of learning to write did both students find surprising?', ans:'C. improved concentration', type:'multiple_choice', opts:'["A. improved fine motor skills","B. improved memory","C. improved concentration","D. improved imagination","E. improved spatial awareness"]' },
        { qi:22, text:'Which TWO benefits for children of learning to write did both students find surprising?', ans:'E. improved spatial awareness', type:'multiple_choice', opts:'["A. improved fine motor skills","B. improved memory","C. improved concentration","D. improved imagination","E. improved spatial awareness"]' },
        { qi:23, text:'For children with dyspraxia, which TWO problems with handwriting do the students think are easiest to correct?', ans:'A. not spacing letters correctly', type:'multiple_choice', opts:'["A. not spacing letters correctly","B. not writing in a straight line","C. applying too much pressure when writing","D. confusing letter shapes","E. writing very slowly"]' },
        { qi:24, text:'For children with dyspraxia, which TWO problems with handwriting do the students think are easiest to correct?', ans:'C. applying too much pressure when writing', type:'multiple_choice', opts:'["A. not spacing letters correctly","B. not writing in a straight line","C. applying too much pressure when writing","D. confusing letter shapes","E. writing very slowly"]' },
        { qi:25, text:'What does the woman say about using laptops to teach writing to children with dyslexia?', ans:'C. Children react more positively if they make a mistake', type:'multiple_choice', opts:'["A. Children often lack motivation to learn that way","B. Children become fluent relatively quickly","C. Children react more positively if they make a mistake"]' },
        { qi:26, text:'When discussing whether to teach cursive or print writing, the woman thinks that', ans:'A. cursive writing disadvantages a certain group of children', type:'multiple_choice', opts:'["A. cursive writing disadvantages a certain group of children","B. print writing is associated with lower academic performance","C. most teachers in the UK prefer a traditional approach to handwriting"]' },
        { qi:27, text:'According to the students, what impact does poor handwriting have on exam performance?', ans:'A. There is evidence to suggest grades are affected by poor handwriting', type:'multiple_choice', opts:'["A. There is evidence to suggest grades are affected by poor handwriting","B. Neat handwriting is less important now than it used to be","C. Candidates write more slowly and produce shorter answers"]' },
        { qi:28, text:'What prediction does the man make about the future of handwriting?', ans:'B. Children will continue to learn to write by hand', type:'multiple_choice', opts:'["A. Touch typing will be taught before writing by hand","B. Children will continue to learn to write by hand","C. People will dislike handwriting on digital devices"]' },
        { qi:29, text:'The woman is concerned that relying on digital devices has made it difficult for her to', ans:'B. spell and punctuate', type:'multiple_choice', opts:'["A. take detailed notes","B. spell and punctuate","C. read old documents"]' },
        { qi:30, text:'How do the students feel about their own handwriting?', ans:'C. regretful that they have lost the habit', type:'multiple_choice', opts:'["A. concerned they are unable to write quickly","B. embarrassed by comments made about it","C. regretful that they have lost the habit"]' },
      ],
    },
    {
      id: 20044,
      instructions: 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 The importance of birds of prey to the local communities\n## Q34 Falling numbers of birds of prey\n## Q37 Ways of protecting chickens from birds of prey',
      questions: [
        { qi:31, text:'They destroy ______ and other rodents', ans:'rats', type:'fill_blank' },
        { qi:32, text:'They help to prevent farmers from being bitten by ______', ans:'snakes', type:'fill_blank' },
        { qi:33, text:'They now support the economy by encouraging ______ in the area', ans:'tourism', type:'fill_blank' },
        { qi:34, text:'The birds may be accidentally killed by ______ when they are hunting or sleeping', ans:'traffic', type:'fill_blank' },
        { qi:35, text:'by electrocution from contact with power lines, especially at times when there is a lot of ______', ans:'rain', type:'fill_blank' },
        { qi:36, text:'Local farmers may illegally shoot them or ______ them', ans:'poison', type:'fill_blank' },
        { qi:37, text:'providing a ______ for chickens (expensive)', ans:'building', type:'fill_blank' },
        { qi:38, text:'keeping a ______', ans:'dog', type:'fill_blank' },
        { qi:39, text:'Making a ______, e.g. with metal objects', ans:'noise', type:'fill_blank' },
        { qi:40, text:'A ______ of methods is usually most effective', ans:'combination', type:'fill_blank' },
      ],
    },
  ],
};

async function updateTest(label: string, data: typeof T3) {
  for (const sec of data.sections) {
    console.log(`  ${label} S${sec.id % 10}...`);
    await p.iELTSExamSection.update({ where: { id: sec.id }, data: { instructions: sec.instructions } });
    for (const q of sec.questions) {
      const d: any = { questionText: q.text, questionType: q.type, correctAnswer: q.ans };
      if (q.opts) d.options = q.opts;
      if (q.acc) d.acceptableAnswers = q.acc;
      await p.iELTSQuestion.updateMany({ where: { sectionId: sec.id, questionIndex: q.qi }, data: d });
    }
  }
}

async function main() {
  console.log('Updating T3...');
  await updateTest('T3', T3);
  console.log('Updating T4...');
  await updateTest('T4', T4);
  await p.$disconnect();
  console.log('Done! T3+T4 updated from PDF.');
}
main().catch(e => { console.error(e); process.exit(1); });
