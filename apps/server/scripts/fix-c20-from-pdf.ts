import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// All data extracted directly from C20 PDF

// ============ T2 ============
const T2 = {
  sections: [
    {
      id: 20021,
      instructions: 'Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.',
      questions: [
        { qi:1, text:'Local councils can arrange practical support to help those caring for elderly people at home. This can give the carer: time for other responsibilities, a ______', ans:'break', type:'fill_blank' },
        { qi:2, text:'Assessment of needs: how much ______ is involved', ans:'time', type:'fill_blank' },
        { qi:3, text:'helping her have a ______', ans:'shower', type:'fill_blank' },
        { qi:4, text:'dealing with ______', ans:'money', type:'fill_blank' },
        { qi:5, text:'any aspects of caring that are especially difficult, e.g. loss of ______', ans:'memory', type:'fill_blank' },
        { qi:6, text:'______', ans:'lifting', type:'fill_blank' },
        { qi:7, text:'preventing a ______', ans:'fall', type:'fill_blank' },
        { qi:8, text:'Types of support: transport costs, e.g. cost of a ______', ans:'taxi', type:'fill_blank' },
        { qi:9, text:'car-related costs, e.g. fuel and ______', ans:'insurance', type:'fill_blank' },
        { qi:10, text:'help to reduce ______', ans:'stress', type:'fill_blank' },
      ],
    },
    {
      id: 20022,
      instructions: 'Questions 11-16: What is the role of the volunteers in each of the following activities? Choose SIX answers from the box and write the correct letter, A-I, next to Questions 11-16.\nQuestions 17-20: Choose the correct letter, A, B or C.',
      questions: [
        { qi:11, text:'walking around the town centre', ans:'D. giving advice to visitors', type:'matching', opts:'["A. providing entertainment","B. providing publicity about a council service","C. contacting local businesses","D. giving advice to visitors","E. collecting feedback on events","F. selling tickets","G. introducing guest speakers at an event","H. encouraging cooperation between local organisations","I. helping people find their seats"]' },
        { qi:12, text:'helping at concerts', ans:'I. helping people find their seats', type:'matching', opts:'["A. providing entertainment","B. providing publicity about a council service","C. contacting local businesses","D. giving advice to visitors","E. collecting feedback on events","F. selling tickets","G. introducing guest speakers at an event","H. encouraging cooperation between local organisations","I. helping people find their seats"]' },
        { qi:13, text:'getting involved with community groups', ans:'H. encouraging cooperation between local organisations', type:'matching', opts:'["A. providing entertainment","B. providing publicity about a council service","C. contacting local businesses","D. giving advice to visitors","E. collecting feedback on events","F. selling tickets","G. introducing guest speakers at an event","H. encouraging cooperation between local organisations","I. helping people find their seats"]' },
        { qi:14, text:'helping with a magazine', ans:'E. collecting feedback on events', type:'matching', opts:'["A. providing entertainment","B. providing publicity about a council service","C. contacting local businesses","D. giving advice to visitors","E. collecting feedback on events","F. selling tickets","G. introducing guest speakers at an event","H. encouraging cooperation between local organisations","I. helping people find their seats"]' },
        { qi:15, text:'participating at lunches for retired people', ans:'A. providing entertainment', type:'matching', opts:'["A. providing entertainment","B. providing publicity about a council service","C. contacting local businesses","D. giving advice to visitors","E. collecting feedback on events","F. selling tickets","G. introducing guest speakers at an event","H. encouraging cooperation between local organisations","I. helping people find their seats"]' },
        { qi:16, text:'helping with the website', ans:'B. providing publicity about a council service', type:'matching', opts:'["A. providing entertainment","B. providing publicity about a council service","C. contacting local businesses","D. giving advice to visitors","E. collecting feedback on events","F. selling tickets","G. introducing guest speakers at an event","H. encouraging cooperation between local organisations","I. helping people find their seats"]' },
        { qi:17, text:'Which event requires the largest number of volunteers?', ans:'B. the science festival', type:'multiple_choice', opts:'["A. the music festival","B. the science festival","C. the book festival"]' },
        { qi:18, text:'What is the most important requirement for volunteers at the festivals?', ans:'A. interpersonal skills', type:'multiple_choice', opts:'["A. interpersonal skills","B. personal interest in the event","C. flexibility"]' },
        { qi:19, text:'New volunteers will start working in the week beginning', ans:'B. 9 September', type:'multiple_choice', opts:'["A. 2 September","B. 9 September","C. 23 September"]' },
        { qi:20, text:'What is the next annual event for volunteers?', ans:'A. a boat trip', type:'multiple_choice', opts:'["A. a boat trip","B. a barbecue","C. a party"]' },
      ],
    },
    {
      id: 20023,
      instructions: 'Questions 21-25: What is Rosie and Colin\'s opinion about each of the following aspects of human geography? Choose FIVE answers from the box and write the correct letter, A-G.\nQuestions 26-30: Choose the correct letter, A, B or C.',
      questions: [
        { qi:21, text:'Population', ans:'D. It will be easy to find facts about this', type:'matching', opts:'["A. The information given about this was too vague","B. This may not be relevant to their course","C. This will involve only a small number of statistics","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. No useful research has been done on this","G. The information provided about this was interesting"]' },
        { qi:22, text:'Health', ans:'G. The information provided about this was interesting', type:'matching', opts:'["A. The information given about this was too vague","B. This may not be relevant to their course","C. This will involve only a small number of statistics","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. No useful research has been done on this","G. The information provided about this was interesting"]' },
        { qi:23, text:'Economies', ans:'B. This may not be relevant to their course', type:'matching', opts:'["A. The information given about this was too vague","B. This may not be relevant to their course","C. This will involve only a small number of statistics","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. No useful research has been done on this","G. The information provided about this was interesting"]' },
        { qi:24, text:'Culture', ans:'A. The information given about this was too vague', type:'matching', opts:'["A. The information given about this was too vague","B. This may not be relevant to their course","C. This will involve only a small number of statistics","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. No useful research has been done on this","G. The information provided about this was interesting"]' },
        { qi:25, text:'Poverty', ans:'E. The facts about this may not be reliable', type:'matching', opts:'["A. The information given about this was too vague","B. This may not be relevant to their course","C. This will involve only a small number of statistics","D. It will be easy to find facts about this","E. The facts about this may not be reliable","F. No useful research has been done on this","G. The information provided about this was interesting"]' },
        { qi:26, text:'Rosie says that in her own city the main problem is', ans:'C. unemployment', type:'multiple_choice', opts:'["A. crime","B. housing","C. unemployment"]' },
        { qi:27, text:'What recent additions to the outskirts of their cities are both students happy about?', ans:'A. conference centres', type:'multiple_choice', opts:'["A. conference centres","B. sports centres","C. retail centres"]' },
        { qi:28, text:'The students agree that developing disused industrial sites may', ans:'A. have unexpected costs', type:'multiple_choice', opts:'["A. have unexpected costs","B. damage the urban environment","C. destroy valuable historical buildings"]' },
        { qi:29, text:'The students will mention Masdar City as an example of an attempt to achieve', ans:'B. sustainable energy use', type:'multiple_choice', opts:'["A. daily collections for waste recycling","B. sustainable energy use","C. free transport for everyone"]' },
        { qi:30, text:'When discussing the Eco town of Greenhill Abbots, Colin is uncertain about', ans:'C. how much of it has actually been built', type:'multiple_choice', opts:'["A. what its objectives were","B. why there was opposition to it","C. how much of it has actually been built"]' },
      ],
    },
    {
      id: 20024,
      instructions: 'Complete the notes below. Write ONE WORD ONLY for each answer.\n## Q31 Developing food trends\n## Q35 Marketing campaigns\n## Q39 Ethical concerns',
      questions: [
        { qi:31, text:'The growth in interest in food fashions started with ______ of food being shared on social media', ans:'photos', type:'fill_blank', acc:'["photographs","pictures"]' },
        { qi:32, text:'Sales of ______ food brands have grown this way', ans:'vegan', type:'fill_blank' },
        { qi:33, text:'Famous ______ are influential', ans:'chefs', type:'fill_blank', acc:'["cooks"]' },
        { qi:34, text:'The avocado: ______ were invited to visit growers in South Africa', ans:'journalists', type:'fill_blank', acc:'["reporters"]' },
        { qi:35, text:'Advertising focused on its ______ benefits', ans:'health', type:'fill_blank' },
        { qi:36, text:'Oat milk: Promotion in the USA through ______ shops reduced the need for advertising', ans:'coffee', type:'fill_blank' },
        { qi:37, text:'It appealed to consumers who are concerned about the ______', ans:'environment', type:'fill_blank' },
        { qi:38, text:'Norwegian skrei: has helped strengthen the ______ of Norwegian seafood', ans:'reputation', type:'fill_blank' },
        { qi:39, text:'Quinoa: Its success led to an increase in its ______', ans:'price', type:'fill_blank', acc:'["cost"]' },
        { qi:40, text:'Overuse of resources resulted in poor quality ______', ans:'soil', type:'fill_blank' },
      ],
    },
  ],
};

async function main() {
  for (const sec of T2.sections) {
    console.log(`\nUpdating section ${sec.id}...`);

    // Update instructions
    await p.iELTSExamSection.update({ where: { id: sec.id }, data: { instructions: sec.instructions } });

    for (const q of sec.questions) {
      const data: any = {
        questionText: q.text,
        questionType: q.type,
        correctAnswer: q.ans,
      };
      if (q.opts) data.options = q.opts;
      if (q.acc) data.acceptableAnswers = q.acc;

      await p.iELTSQuestion.updateMany({
        where: { sectionId: sec.id, questionIndex: q.qi },
        data,
      });
    }
    console.log(`  ${sec.questions.length} questions updated`);
  }

  await p.$disconnect();
  console.log('\nT2 done!');
}

main().catch(e => { console.error(e); process.exit(1); });
