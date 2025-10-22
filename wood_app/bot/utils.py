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