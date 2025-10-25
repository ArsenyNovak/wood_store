from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from wood_app.bot.kbs import main_keyboard, admin_keyboard
from wood_app.config import settings

admin_router = Router()


@admin_router.message(F.text == '🔑 Админ панель', F.from_user.id.in_([settings.ADMIN_ID]))
async def admin_panel(message: Message):
    await message.answer(
        f"Здравствуйте, <b>{message.from_user.full_name}</b>!\n\n"
        "Добро пожаловать в панель администратора. Здесь вы можете:\n"
        "• Добавлять и редактировать товары\n",
        reply_markup=admin_keyboard(user_id=message.from_user.id)
    )


@admin_router.callback_query(F.data == 'back_home')
async def cmd_back_home_admin(callback: CallbackQuery):
    await callback.answer(f"С возвращением, {callback.from_user.full_name}!")
    await callback.message.answer(
        f"С возвращением, <b>{callback.from_user.full_name}</b>!\n\n"
        "Надеемся, что работа в панели администратора была продуктивной.\n\n"
        "Чем еще я могу помочь вам сегодня?",
        reply_markup=main_keyboard(user_id=callback.from_user.id, first_name=callback.from_user.first_name)
    )