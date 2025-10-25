from aiogram.types import ReplyKeyboardMarkup, WebAppInfo, InlineKeyboardMarkup
from aiogram.utils.keyboard import ReplyKeyboardBuilder, InlineKeyboardBuilder

from wood_app.config import settings


def main_keyboard(user_id: int, first_name: str) -> ReplyKeyboardMarkup:
    kb = ReplyKeyboardBuilder()
    url_applications = f"{settings.BASE_SITE}/applications?user_id={user_id}"
    url_add_application = f'{settings.BASE_SITE}/form?user_id={user_id}&first_name={first_name}'
    kb.button(text="Каталог", web_app=WebAppInfo(url=url_applications))
    # kb.button(text="📝 Добавить идею", web_app=WebAppInfo(url=url_add_application))
    kb.button(text="ℹ️ О проекте")
    if user_id == settings.ADMIN_ID:
        kb.button(text="🔑 Админ панель")
    kb.adjust(1)
    return kb.as_markup(resize_keyboard=True)

def admin_keyboard(user_id: int) -> InlineKeyboardMarkup:
    url_applications = f"{settings.BASE_SITE}/applications/create_products"
    kb = InlineKeyboardBuilder()
    kb.button(text="🏠 На главную", callback_data="back_home")
    kb.button(text="➕ Добавить изделие", web_app=WebAppInfo(url=url_applications))
    kb.adjust(1)
    return kb.as_markup()


def back_keyboard() -> ReplyKeyboardMarkup:
    kb = ReplyKeyboardBuilder()
    kb.button(text="🔙 Назад")
    kb.adjust(1)
    return kb.as_markup(resize_keyboard=True)