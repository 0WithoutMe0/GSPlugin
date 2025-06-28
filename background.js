/* background.js – полностью обновлённый */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SAVE_GALLERY' && Array.isArray(msg.media)) {

    /* 1. Сохраняем все медиа-файлы */
    const htmlParts = [`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Saved Gallery</title>
        <style>
          img, video { max-width: 100%; display: block; margin-bottom: 8px; }
          figure { margin: 1em 0; }
          figcaption { font-size: 14px; color: #444; font-style: italic; margin-top: 4px; }
        </style>
      </head>
      <body>
    `];

    msg.media.forEach((item) => {
      /* ── главное изменение ──  
         если popup передал item.folder – используем его;
         иначе по старой логике */
      const folder =
        item.folder ||
        (item.type === 'image' ? 'images' :
         item.type === 'video' ? 'videos' : '');

      chrome.downloads.download({
        url:      item.url,
        filename: `gallery/${folder}/${item.name}`
      });

      /* Формируем предварительный index.html */
      if (item.type === 'image') {
        htmlParts.push(`
          <figure>
            <img src="${folder}/${item.name}" alt="">
            <figcaption>${item.caption}</figcaption>
          </figure>
        `);
      } else if (item.type === 'video') {
        htmlParts.push(`
          <figure>
            <video controls src="${folder}/${item.name}" width="600"></video>
            <figcaption>${item.caption}</figcaption>
          </figure>
        `);
      }
    });

    /* 2. Сохраняем index.html */
    htmlParts.push('</body></html>');
    const htmlContent = htmlParts.join('\n');
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);

    chrome.downloads.download({
      url:      dataUrl,
      filename: 'gallery/index.html'
    });
  }
});
