const testUpload = async () => {
  try {
    const fetchResponse = await fetch('https://image.pollinations.ai/prompt/apple?nologo=true');
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, 'test.jpg');
    
    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });
    const url = await catboxRes.text();
    console.log("Success! Hosted URL:", url);
  } catch (e) {
    console.error("Error:", e);
  }
};
testUpload();
