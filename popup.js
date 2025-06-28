/* popup.js – полностью обновлённый */
document.getElementById('saveBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func:  collectMedia
  });
});

function collectMedia() {
  /* --- изображения --- */

  /* 1) Все картинки, подходящие по размеру */
  const allImgs = Array.from(document.querySelectorAll('img')).filter(
    img => img.naturalWidth > 150 && img.naturalHeight > 150 && img.src
  );

  /* 2) Картинки, расположенные внутри .gallery (.gallery-container > .gallery img) */
  const galleryImgs = Array.from(document.querySelectorAll('.gallery img'));

  const imageData = [];

  /* 2.1 Сначала – «галерейные» (папка gallery-images) */
  galleryImgs.forEach((img, idx) => {
    imageData.push({
      type:    'image',
      url:     img.src,
      caption: img.alt || img.title || '',
      name:    `gal_${idx.toString().padStart(3, '0')}.jpg`,
      folder:  'gallery-images'      // ключевой параметр
    });
  });

  /* 2.2 Затем – все прочие картинки (папка images) */
  allImgs
    .filter(img => !galleryImgs.includes(img))
    .forEach((img, idx) => {
      imageData.push({
        type:    'image',
        url:     img.src,
        caption: img.alt || img.title || '',
        name:    `img_${idx.toString().padStart(3, '0')}.jpg`,
        folder:  'images'
      });
    });

  /* Отправляем одним пакетом, если есть что сохранять */
  if (imageData.length) {
    chrome.runtime.sendMessage({ type: 'SAVE_GALLERY', media: imageData });
  }

  /* --- видео (старый код, добавлена папка videos) --- */
  const videos = document.querySelectorAll('video');
  videos.forEach((vid, idx) => {
    vid.addEventListener('play', () => {
      const source = vid.querySelector('source');
      const src    = source ? source.src : vid.src;

      if (src && src.startsWith('http')) {
        chrome.runtime.sendMessage({
          type: 'SAVE_GALLERY',
          media: [{
            type:    'video',
            url:     src,
            caption: vid.title || 'Видео',
            name:    `video_${idx.toString().padStart(3, '0')}.mp4`,
            folder:  'videos'
          }]
        });
      }
    }, { once: true });
  });
}
