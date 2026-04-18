const https = require('https');

https.get('https://image.pollinations.ai/prompt/realistic%20photo%20of%20a%20fresh%20red%20apple%20on%20white%20background?width=800&height=800&nologo=true', (res) => {
  console.log('Status Code:', res.statusCode);
  if (res.statusCode === 200) {
      console.log('Successfully generated AI image from Pollinations.ai!');
  } else {
      console.log('Failed');
  }
}).on('error', (e) => {
  console.error(e);
});
