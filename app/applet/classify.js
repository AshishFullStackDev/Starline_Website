const fs = require('fs');
const path = require('path');
const https = require('https');

async function classifyBatch(filenames) {
  const parts = [];
  parts.push({
    text: 'You are an adventure park photo evaluator. For each of the following ' + filenames.length + ' images in exact order, classify whether it shows REAL PERSON / PEOPLE ACTIVELY PARTICIPATING IN / DOING AN ADVENTURE ACTIVITY (e.g. actively climbing an adventure wall, walking/balancing on high rope obstacle/bridge, riding zipline, riding giant swing / sky cycle / human gyro / ejector ride / thrill ride, doing adventure obstacle course in harness, jumping, sliding).\n\n' +
    'CRITICAL RULES:\n' +
    '- set has_people_doing_activity = true ONLY if real people are actively engaged in / riding / doing the adventure activity.\n' +
    '- set has_people_doing_activity = false if the photo shows:\n' +
    '  * empty equipment, empty adventure towers, empty ropes/poles without active participants\n' +
    '  * empty rides, vacant seats/tracks\n' +
    '  * construction/installation workers doing welding/fabrication or construction site groundwork\n' +
    '  * empty bridge or empty scenery\n' +
    '  * website screenshots, logos, diagrams, or product catalog photos\n' +
    '  * people just standing on normal flat ground posing for a portrait without doing an activity\n\n' +
    'Return a strict JSON array with exactly ' + filenames.length + ' objects in same order:\n' +
    '[{"filename": string, "has_people_doing_activity": boolean, "activity_type": string, "title": string, "category": "ropes"|"ziplines"|"towers"|"extreme"|"climbing"|"aerial", "categoryLabel": string, "reason": string}]'
  });

  for (const fn of filenames) {
    const filePath = path.join(__dirname, 'images', 'activity_images', fn);
    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    parts.push({ text: 'Image filename: ' + fn });
    parts.push({ inlineData: { mimeType, data: fileData.toString('base64') } });
  }

  const payload = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { responseMimeType: 'application/json' }
  });

  return new Promise((resolve) => {
    const sendReq = (retries = 3) => {
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: '/v1beta/models/gemini-3.6-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              console.log('API Error for batch (' + json.error.code + '):', json.error.message ? json.error.message.substring(0, 60) : '');
              if (json.error.code === 429 && retries > 0) {
                setTimeout(() => sendReq(retries - 1), 3500);
                return;
              }
              resolve(filenames.map(f => ({ filename: f, has_people_doing_activity: false, error: json.error.message })));
              return;
            }
            const text = json.candidates[0].content.parts[0].text;
            const parsed = JSON.parse(text);
            resolve(parsed);
          } catch(e) {
            console.error('Parse error:', data.substring(0, 100));
            resolve(filenames.map(f => ({ filename: f, has_people_doing_activity: false })));
          }
        });
      });
      req.on('error', err => {
        console.error('Req error:', err.message);
        resolve(filenames.map(f => ({ filename: f, has_people_doing_activity: false, error: err.message })));
      });
      req.write(payload);
      req.end();
    };
    sendReq();
  });
}

(async () => {
  const dir = path.join(__dirname, 'images', 'activity_images');
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort();
  console.log('Total files to classify:', files.length);

  const results = [];
  const batchSize = 4;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log('Processing batch ' + (Math.floor(i / batchSize) + 1) + '/' + Math.ceil(files.length / batchSize));
    const res = await classifyBatch(batch);
    results.push(...res);
    await new Promise(r => setTimeout(r, 1200));
  }

  const outPath = path.join(__dirname, 'active_gallery_data.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('SUCCESS! Saved to ' + outPath);
  const active = results.filter(r => r.has_people_doing_activity);
  console.log('Active count:', active.length, 'Total:', results.length);
})();
