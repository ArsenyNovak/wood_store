const tg = window.Telegram.WebApp;
const yearSpan = document.getElementById('year');


yearSpan.textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // 1. Загрузка файлов через formData
      const filesFormData = new FormData();
      const filesInput = form.querySelector('input[name="images"]');
      for (const file of filesInput.files) {
        filesFormData.append('files', file);
      }
      console.log(filesFormData)
      let uploadedFiles = [];
      if (filesInput.files.length > 0) {
        const uploadResponse = await fetch('/applications/upload_files', {
          method: 'POST',
          body: filesFormData,
        });
        const uploadResult = await uploadResponse.json();
        console.log(uploadResult)
        uploadedFiles = uploadResult.files.map(f => f.name); // или путь по вашему API
      }
      console.log(uploadedFiles)
      // 2. Формируем JSON с остальными данными и именами файлов
      const formData = new FormData(form);
      const jsonObject = {};
      for (const [key, value] of formData.entries()) {
        if (key !== 'images') { // уже обработали
          jsonObject[key] = value;
        }
      }
      jsonObject.images = uploadedFiles; // вставляем имена файлов

      // 3. Отправляем JSON на основной эндпоинт
      const jsonData = JSON.stringify(jsonObject);
      console.log(jsonData)
      try {
          const response = await fetch('/applications/create_products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: jsonData,
          });
          const result = await response.json();
          console.log('Response:', result);

          // Закрываем Telegram WebApp
          setTimeout(() => {
            window.Telegram.WebApp.close();
          }, 100);
      } catch (error) {
          console.error('Error sending POST request:', error);
      }
  });
});

