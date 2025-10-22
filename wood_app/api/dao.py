from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from wood_app.dao.base import BaseDAO
from wood_app.api.models import Category, Product, User, ProductImage
from wood_app.database import async_session_maker

class CategoryDAO(BaseDAO):
    model = Category

class ProductDAO(BaseDAO):
    model = Product

class UserDAO(BaseDAO):
    model = User

class ProductImageDAO(BaseDAO):
    model = ProductImage