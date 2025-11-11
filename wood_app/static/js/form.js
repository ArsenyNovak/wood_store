const tg = window.Telegram.WebApp;
const yearSpan = document.getElementById('year');


yearSpan.textContent = new Date().getFullYear();

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file); // вернёт строку с префиксом data:[тип];base64,[данные]
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
      const base64File = await fileToBase64(file);
      jsonObject.images.push({ name: file.name, content: base64File });
    }

    // Отправляем JSON
    try {
      const response = await fetch('wood/applications/create_products', {
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

