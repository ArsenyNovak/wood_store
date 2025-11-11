from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload
from wood_app.dao.base import BaseDAO
from wood_app.api.models import Category, Product, User, ProductImage
from wood_app.database import async_session_maker

class CategoryDAO(BaseDAO):
    model = Category

class ProductDAO(BaseDAO):
    model = Product

    @classmethod
    async def find_all_with_images(cls, **filter_by):
        """
        Асинхронно находит и возвращает все экземпляры модели, удовлетворяющие указанным критериям.

        Аргументы:
            **filter_by: Критерии фильтрации в виде именованных параметров.

        Возвращает:
            Список экземпляров модели.
        """
        async with async_session_maker() as session:
            query = (
                select(cls.model).filter_by(**filter_by)
                .options(selectinload(cls.model.images))
                .options(selectinload(cls.model.category))
            )

            result = await session.execute(query)
            return result.scalars().all()

class UserDAO(BaseDAO):
    model = User

class ProductImageDAO(BaseDAO):
    model = ProductImage