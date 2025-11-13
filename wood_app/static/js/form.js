const tg = window.Telegram.WebApp;
const yearSpan = document.getElementById('year');


const input = document.getElementById('images');
const fileCount = document.getElementById('imagesCount');

input.addEventListener('change', () => {
  const count = input.files.length;
  if (count === 0) {
    fileCount.textContent = '';
  } else {
    fileCount.textContent = `Выбрано ${count} фото`;
  }
});


yearSpan.textContent = new Date().getFullYear();

function compressImage(file, maxWidth = 1000, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Масштабируем изображение, сохраняя пропорции
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Получаем сжатое изображение в base64 с заданным качеством (для JPEG)
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const jsonObject = {};

    // Преобразуем текстовые поля
    formData.forEach((value, key) => {
      if (key !== 'images') { // исключаем файлы
        jsonObject[key] = value;
      }
    });

    // Обрабатываем файлы в base64
    const filesInput = form.querySelector('input[name="images"]');
    const files = filesInput.files;
    jsonObject.images = [];

    for (let file of files) {
      const compressedBase64 = await compressImage(file, 800, 0.7);
      jsonObject.images.push({ name: file.name, content: compressedBase64 });
    }

    // Отправляем JSON
    try {
      const response = await fetch('/wood/applications/create_products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonObject)
      });
      const result = await response.json();
      console.log('Response:', result);

      setTimeout(() => {
        window.Telegram.WebApp.close();
      }, 100);
    } catch (error) {
      console.error('Error sending POST request:', error);
    }
  });
});

