let htmlParts = [
  `<!DOCTYPE html>
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
  <body>`
];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SAVE_GALLERY') {
    msg.media.forEach((item) => {
      const folder = item.type === 'image' ? 'images' : 'videos';

      chrome.downloads.download({
        url: item.url,
        filename: `gallery/${folder}/${item.name}`
      });

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

    // Всегда закрываем тег </body></html> для сохранения
    const fullHtml = [...htmlParts, '</body></html>'].join('\n');
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml);

    chrome.downloads.download({
      url: dataUrl,
      filename: 'gallery/index.html'
    });
  }
});
