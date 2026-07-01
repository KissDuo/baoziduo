import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

const BASE = path.join(homedir(), 'Desktop', 'dictation-audio');
const VOICE = 'en-US-JennyNeural';

interface DictationItem {
  id: string;
  display: string;
  ttsText: string;
  answer: string;
}

async function generate(category: string, items: DictationItem[]) {
  const dir = path.join(BASE, category);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`\n=== ${category} (${items.length} items) ===`);

  for (const item of items) {
    const rawPath = path.join(dir, `${item.id}_raw.mp3`);
    const mp3Path = path.join(dir, `${item.id}.mp3`);

    try {
      // 1. Generate TTS audio
      const tmpTxt = path.join(dir, '.tmp.txt');
      fs.writeFileSync(tmpTxt, item.ttsText);
      execSync(
        `python3 -m edge_tts -f "${tmpTxt}" --voice ${VOICE} --rate=-20% --write-media "${rawPath}"`,
        { timeout: 30000 }
      );
      fs.unlinkSync(tmpTxt);

      // 2. Trim silence at start, amplify volume, and save final
      execSync(
        `ffmpeg -y -i "${rawPath}" -af "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-50dB,volume=3.0" -q:a 5 "${mp3Path}"`,
        { timeout: 15000 }
      );
      fs.unlinkSync(rawPath);

      console.log(`  ✅ ${item.id}: ${item.display}`);
    } catch (e: any) {
      console.error(`  ❌ ${item.id}: ${e.message}`);
    }
  }
}

async function main() {
  // ═══════════════════════════════════
  // 1. NUMBERS — 数字精听
  // ═══════════════════════════════════
  const numbers: DictationItem[] = [
    { id: 'phone-01', display: '212-555-1234', ttsText: 'two one two, five five five, one two three four.', answer: '2125551234' },
    { id: 'phone-02', display: '800-333-7777', ttsText: 'eight hundred, triple three, triple seven.', answer: '8003337777' },
    { id: 'phone-03', display: '020-7946-0018', ttsText: 'oh two oh, seven nine four six, double oh one eight.', answer: '02079460018' },
    { id: 'phone-04', display: '+44-7911-123456', ttsText: 'plus four four, seven nine double one, one two three four five six.', answer: '447911123456' },
    { id: 'phone-05', display: '1-800-FLOWERS', ttsText: 'one, eight hundred, F L O W E R S.', answer: '1800FLOWERS' },
    { id: 'money-01', display: '$1,250.99', ttsText: 'one thousand, two hundred and fifty dollars, and ninety-nine cents.', answer: '1250.99' },
    { id: 'money-02', display: '£3.50', ttsText: 'three pounds and fifty pence.', answer: '3.50' },
    { id: 'money-03', display: '$0.75', ttsText: 'seventy-five cents.', answer: '0.75' },
    { id: 'date-01', display: '1984', ttsText: 'nineteen eighty-four.', answer: '1984' },
    { id: 'date-02', display: '2026', ttsText: 'twenty twenty-six.', answer: '2026' },
    { id: 'date-03', display: '11/09/2001', ttsText: 'September eleventh, two thousand and one.', answer: '11092001' },
    { id: 'num-01', display: '1,234,567', ttsText: 'one million, two hundred and thirty-four thousand, five hundred and sixty-seven.', answer: '1234567' },
    { id: 'num-02', display: '0.005', ttsText: 'zero point zero zero five.', answer: '0.005' },
    { id: 'num-03', display: '2/3', ttsText: 'two thirds.', answer: '2/3' },
    { id: 'num-04', display: '50%', ttsText: 'fifty percent.', answer: '50%' },
    { id: 'num-05', display: 'Room 307', ttsText: 'room three oh seven.', answer: '307' },
    { id: 'num-06', display: 'PIN: 4829', ttsText: 'four eight two nine.', answer: '4829' },
    { id: 'num-07', display: 'Ref: AB-2026-X', ttsText: 'A B, dash, two zero two six, dash, X.', answer: 'AB2026X' },
    { id: 'num-08', display: 'Call 555-0199', ttsText: 'five five five, oh one double nine.', answer: '5550199' },
    { id: 'num-09', display: 'Price: $14.99', ttsText: 'fourteen dollars and ninety-nine cents.', answer: '14.99' },
  ];
  await generate('numbers', numbers);

  // ═══════════════════════════════════
  // 2. NAMES — 人名精听（读一遍，拼一遍）
  // ═══════════════════════════════════
  const names: DictationItem[] = [
    { id: 'name-01', display: 'Siobhan', ttsText: 'Siobhan. S I O B H A N.', answer: 'Siobhan' },
    { id: 'name-02', display: 'Tchaikovsky', ttsText: 'Tchaikovsky. T C H A I K O V S K Y.', answer: 'Tchaikovsky' },
    { id: 'name-03', display: 'Nguyen', ttsText: 'Nguyen. N G U Y E N.', answer: 'Nguyen' },
    { id: 'name-04', display: 'Phoebe', ttsText: 'Phoebe. P H O E B E.', answer: 'Phoebe' },
    { id: 'name-05', display: 'Zbigniew', ttsText: 'Zbigniew. Z B I G N I E W.', answer: 'Zbigniew' },
    { id: 'name-06', display: 'Aoife', ttsText: 'Aoife. A O I F E.', answer: 'Aoife' },
    { id: 'name-07', display: 'Rhys', ttsText: 'Rhys. R H Y S.', answer: 'Rhys' },
    { id: 'name-08', display: 'Cholmondeley', ttsText: 'Cholmondeley. C H O L M O N D E L E Y.', answer: 'Cholmondeley' },
    { id: 'name-09', display: 'Guillaume', ttsText: 'Guillaume. G U I L L A U M E.', answer: 'Guillaume' },
    { id: 'name-10', display: 'Saoirse', ttsText: 'Saoirse. S A O I R S E.', answer: 'Saoirse' },
    { id: 'name-11', display: 'Bartholomew', ttsText: 'Bartholomew. B A R T H O L O M E W.', answer: 'Bartholomew' },
    { id: 'name-12', display: 'Xanthopoulos', ttsText: 'Xanthopoulos. X A N T H O P O U L O S.', answer: 'Xanthopoulos' },
    { id: 'name-13', display: 'Featherstonehaugh', ttsText: 'Featherstonehaugh. F E A T H E R S T O N E H A U G H.', answer: 'Featherstonehaugh' },
    { id: 'name-14', display: 'Dvořák', ttsText: 'Dvorak. D V O R A K.', answer: 'Dvořák' },
    { id: 'name-15', display: 'Caoimhe', ttsText: 'Caoimhe. C A O I M H E.', answer: 'Caoimhe' },
    { id: 'name-16', display: 'Joaquin', ttsText: 'Joaquin. J O A Q U I N.', answer: 'Joaquin' },
    { id: 'name-17', display: 'Yevgeny', ttsText: 'Yevgeny. Y E V G E N Y.', answer: 'Yevgeny' },
    { id: 'name-18', display: 'Schwarzenegger', ttsText: 'Schwarzenegger. S C H W A R Z E N E G G E R.', answer: 'Schwarzenegger' },
    { id: 'name-19', display: 'Niamh', ttsText: 'Niamh. N I A M H.', answer: 'Niamh' },
    { id: 'name-20', display: 'Beauchamp', ttsText: 'Beauchamp. B E A U C H A M P.', answer: 'Beauchamp' },
  ];
  await generate('names', names);

  // ═══════════════════════════════════
  // 3. PLACES — 地名精听
  // ═══════════════════════════════════
  const places: DictationItem[] = [
    { id: 'place-01', display: 'Gloucester', ttsText: 'Gloucester. G L O U C E S T E R.', answer: 'Gloucester' },
    { id: 'place-02', display: 'Worcestershire', ttsText: 'Worcestershire. W O R C E S T E R S H I R E.', answer: 'Worcestershire' },
    { id: 'place-03', display: 'Leicester', ttsText: 'Leicester. L E I C E S T E R.', answer: 'Leicester' },
    { id: 'place-04', display: 'Llanfairpwllgwyngyll', ttsText: 'Llanfairpwllgwyngyll. L L A N F A I R P W L L G W Y N G Y L L.', answer: 'Llanfairpwllgwyngyll' },
    { id: 'place-05', display: 'Reykjavik', ttsText: 'Reykjavik. R E Y K J A V I K.', answer: 'Reykjavik' },
    { id: 'place-06', display: 'Albuquerque', ttsText: 'Albuquerque. A L B U Q U E R Q U E.', answer: 'Albuquerque' },
    { id: 'place-07', display: 'Cincinnati', ttsText: 'Cincinnati. C I N C I N N A T I.', answer: 'Cincinnati' },
    { id: 'place-08', display: 'Massachusetts', ttsText: 'Massachusetts. M A S S A C H U S E T T S.', answer: 'Massachusetts' },
    { id: 'place-09', display: 'Schenectady', ttsText: 'Schenectady. S C H E N E C T A D Y.', answer: 'Schenectady' },
    { id: 'place-10', display: 'Poughkeepsie', ttsText: 'Poughkeepsie. P O U G H K E E P S I E.', answer: 'Poughkeepsie' },
    { id: 'place-11', display: 'Zimbabwe', ttsText: 'Zimbabwe. Z I M B A B W E.', answer: 'Zimbabwe' },
    { id: 'place-12', display: 'Kyrgyzstan', ttsText: 'Kyrgyzstan. K Y R G Y Z S T A N.', answer: 'Kyrgyzstan' },
    { id: 'place-13', display: 'Ljubljana', ttsText: 'Ljubljana. L J U B L J A N A.', answer: 'Ljubljana' },
    { id: 'place-14', display: 'Phuket', ttsText: 'Phuket. P H U K E T.', answer: 'Phuket' },
    { id: 'place-15', display: 'Yosemite', ttsText: 'Yosemite. Y O S E M I T E.', answer: 'Yosemite' },
    { id: 'place-16', display: 'Connecticut', ttsText: 'Connecticut. C O N N E C T I C U T.', answer: 'Connecticut' },
    { id: 'place-17', display: 'Tucson', ttsText: 'Tucson. T U C S O N.', answer: 'Tucson' },
    { id: 'place-18', display: 'Edinburgh', ttsText: 'Edinburgh. E D I N B U R G H.', answer: 'Edinburgh' },
    { id: 'place-19', display: 'Zagreb', ttsText: 'Zagreb. Z A G R E B.', answer: 'Zagreb' },
    { id: 'place-20', display: 'Oaxaca', ttsText: 'Oaxaca. O A X A C A.', answer: 'Oaxaca' },
  ];
  await generate('places', places);

  // ═══════════════════════════════════
  // 4. MIXED — 混合精听
  // ═══════════════════════════════════
  const mixed: DictationItem[] = [
    { id: 'mixed-01', display: 'Postcode: SW1A 1AA', ttsText: 'S W one A, one A A.', answer: 'SW1A1AA' },
    { id: 'mixed-02', display: 'Flight: BA2498', ttsText: 'B A two four nine eight.', answer: 'BA2498' },
    { id: 'mixed-03', display: 'Plate: AB12 CDE', ttsText: 'A B one two, C D E.', answer: 'AB12CDE' },
    { id: 'mixed-04', display: 'Code: XK-42-BT', ttsText: 'X K, dash, four two, dash, B T.', answer: 'XK42BT' },
    { id: 'mixed-05', display: 'Serial: 7H9Q-4M2K', ttsText: 'seven H nine Q, dash, four M two K.', answer: '7H9Q4M2K' },
    { id: 'mixed-06', display: 'VIN: 1G1YY26U7L5', ttsText: 'one G one Y Y two six U seven L five.', answer: '1G1YY26U7L5' },
    { id: 'mixed-07', display: 'ISBN: 978-0-14-103614-4', ttsText: 'nine seven eight, zero, one four, one zero three, six one four, four.', answer: '9780141036144' },
    { id: 'mixed-08', display: 'Order: #A38-2026X', ttsText: 'A three eight, dash, two zero two six X.', answer: 'A382026X' },
    { id: 'mixed-09', display: 'Gate: B44', ttsText: 'B forty-four.', answer: 'B44' },
    { id: 'mixed-10', display: 'Seat: 12C', ttsText: 'twelve C.', answer: '12C' },
    { id: 'mixed-11', display: 'Wifi: Airport_Free_5G', ttsText: 'WIFI network: Airport underscore Free underscore five G. A I R P O R T, underscore, F R E E, underscore, five, G.', answer: 'Airport_Free_5G' },
    { id: 'mixed-12', display: 'Email: info@co.co.uk', ttsText: 'info, at, C O, dot, C O, dot, U K.', answer: 'info@co.co.uk' },
    { id: 'mixed-13', display: 'Tracking: 1Z999AA101234567', ttsText: 'one Z nine nine nine A A one zero one two three four five six seven.', answer: '1Z999AA101234567' },
    { id: 'mixed-14', display: 'IP: 192.168.1.1', ttsText: 'one nine two dot one six eight dot one dot one.', answer: '192.168.1.1' },
    { id: 'mixed-15', display: 'Time: 14:30 UTC', ttsText: 'fourteen thirty U T C.', answer: '1430' },
    { id: 'mixed-16', display: 'Card: 4532-7891-2345-6789', ttsText: 'four five three two, seven eight nine one, two three four five, six seven eight nine.', answer: '4532789123456789' },
    { id: 'mixed-17', display: 'Room: 12B-04', ttsText: 'twelve B, dash, zero four.', answer: '12B04' },
    { id: 'mixed-18', display: 'Booking: XJ8K9P', ttsText: 'X J eight K nine P.', answer: 'XJ8K9P' },
    { id: 'mixed-19', display: 'Train: 07:45 GWR', ttsText: 'the seven forty-five, G W R service.', answer: '0745GWR' },
    { id: 'mixed-20', display: 'Coupon: SAVE20NOW', ttsText: 'S A V E two zero N O W.', answer: 'SAVE20NOW' },
  ];
  await generate('mixed', mixed);

  console.log('\n✅ All audio generated!');
  console.log(`Output: ${BASE}`);
  console.log(`  numbers: ${numbers.length} files`);
  console.log(`  names: ${names.length} files`);
  console.log(`  places: ${places.length} files`);
  console.log(`  mixed: ${mixed.length} files`);
}

main().catch(e => { console.error(e); process.exit(1); });
