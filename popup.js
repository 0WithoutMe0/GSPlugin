document.getElementById('saveBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectMedia
  });
});

function collectMedia() {

  const images = Array.from(document.querySelectorAll('img')).filter(img => {
    return img.naturalWidth > 150 && img.naturalHeight > 150 && img.src;
  });

  const imageData = images.map((img, idx) => ({
    type: 'image',
    url: img.src,
    caption: img.alt || img.title || '',
    name: `img_${idx.toString().padStart(3, '0')}.jpg`
  }));

  chrome.runtime.sendMessage({ type: 'SAVE_GALLERY', media: imageData });

  
  const videos = document.querySelectorAll('video');
  videos.forEach((vid, idx) => {
    vid.addEventListener('play', () => {
      const source = vid.querySelector('source');
      const src = source ? source.src : vid.src;
      if (src && src.startsWith('http')) {
        chrome.runtime.sendMessage({
          type: 'SAVE_GALLERY',
          media: [{
            type: 'video',
            url: src,
            caption: vid.title || 'Видео',
            name: `video_${idx.toString().padStart(3, '0')}.mp4`
          }]
        });
      }
    }, { once: true });
  });
}
