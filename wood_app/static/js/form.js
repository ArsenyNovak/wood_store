document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;

  const fileInput = document.getElementById('images');
  const fileCount = document.getElementById('imagesCount');

  /* Показываем количество выбранных фото */
  fileInput.addEventListener('change', () => {
    const count = fileInput.files.length;
    fileCount.textContent = count === 0 ? '' : `Выбрано: ${count} фото`;
  });

  /* Сжатие изображения */
  function compressImage(file, maxWidth = 900, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = e => img.src = e.target.result;
      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  }

  /* Обработка формы */
  const form = document.querySelector('.product-form__wrapper');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const json = {};

    /* Текстовые поля */
    formData.forEach((value, key) => {
      if (key !== 'images') {
        json[key] = value;
      }
    });

    /* Файлы */
    const files = fileInput.files;
    json.images = [];

    for (let file of files) {
      const compressed = await compressImage(file, 900, 0.8);
      json.images.push({ name: file.name, content: compressed });
    }

    /* Отправка */
    try {
      const res = await fetch('/wood/applications/create_products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });

      const result = await res.json();
      console.log('Создано:', result);

      setTimeout(() => tg.close(), 100);
    } catch (err) {
      console.error('Ошибка отправки:', err);
    }
  });
});
