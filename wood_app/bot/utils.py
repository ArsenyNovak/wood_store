import re
from aiogram.types import Message
from wood_app.bot.kbs import main_keyboard


def get_about_us_text() -> str:
    return """
🌟 Это маленький проект который совмещает 
два моих занятия: 
 - программирование 👨‍💻; 
 - изготовление изделий из дерева 🪵.
 Здесь я буду выкладывать свои поделки из дерева,
 а также постепенно буду добавлять новый функционал.
 
 p.s. 📝 предложения и замечания вы знаете куда отправлять.
"""


async def greet_user(message: Message, is_new_user: bool) -> None:
    """
    Приветствует пользователя и отправляет соответствующее сообщение.
    """
    greeting = "Добро пожаловать" if is_new_user else "С возвращением"
    status = "Вы успешно зарегистрированы!" if is_new_user else "Рады видеть вас снова!"
    await message.answer(
        f"{greeting}, <b>{message.from_user.full_name}</b>! {status}\n"
        "Чем я могу помочь вам сегодня?",
        reply_markup=main_keyboard(user_id=message.from_user.id, first_name=message.from_user.first_name)
    )


def cyrillicToLatin(text):

    dic_change = {'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e',
    'ё':'yo', 'ж':'zh', 'з':'z', 'и':'i', 'й':'y', 'к':'k',
    'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r',
    'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'kh', 'ц':'ts',
    'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'"', 'ы':'y', 'ь':"'",
    'э':'e', 'ю':'yu', 'я':'ya'
                  }

    text = text.lower()
    translit_text = ''.join(dic_change.get(ch, ch) for ch in text)

    # Удаление всех символов, кроме букв, цифр и пробелов
    translit_text = re.sub(r'[^a-z0-9\s-]', '', translit_text)

    # Замена пробелов и подряд идущих дефисов/пробелов на единичный дефис
    translit_text = re.sub(r'[\s-]+', '_', translit_text)

    # Удаление дефисов с начала и конца строки
    translit_text = translit_text.strip('-')

    return translit_text + '_'