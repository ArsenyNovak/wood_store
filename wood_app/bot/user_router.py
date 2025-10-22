from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import Message
from wood_app.api.dao import UserDAO
from wood_app.bot.utils import greet_user, get_about_us_text

user_router = Router()


@user_router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    """
    Обрабатывает команду /start.
    """
    user = await UserDAO.find_one_or_none(telegram_id=message.from_user.id)

    if not user:
        await UserDAO.add(
            telegram_id=message.from_user.id,
            first_name=message.from_user.first_name,
            username=message.from_user.username
        )

    await greet_user(message, is_new_user=not user)


@user_router.message(F.text == '🔙 Назад')
async def cmd_back_home(message: Message) -> None:
    """
    Обрабатывает нажатие кнопки "Назад".
    """
    await greet_user(message, is_new_user=False)


@user_router.message(F.text == "ℹ️ О проекте")
async def about_us(message: Message):
    await message.answer(get_about_us_text())