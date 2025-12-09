import enum
from datetime import datetime
from typing import Dict

from sqlalchemy import String, Integer, ForeignKey, func, Boolean, BigInteger, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from wood_app.database import Base


class Category(Base):
    __tablename__ = 'categories'

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True,
                                           autoincrement=True)
    title : Mapped[str] = mapped_column(String, nullable=False)
    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = 'products'

    product_id: Mapped[int] = mapped_column(Integer, primary_key=True,
                                           autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    describe: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    unique: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)
    price: Mapped[float] = mapped_column()
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('categories.category_id'))

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship("ProductImage", back_populates="product",
                                                        cascade="all, delete-orphan")
    # cartItem: Mapped["CartItem"] = relationship("CartItem", uselist=False, back_populates="goods")


class ProductImage(Base):
    __tablename__ = 'product_images'

    image_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String, nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey('products.product_id'))

    product: Mapped["Product"] = relationship("Product", back_populates="images")



class User(Base):
    __tablename__ = 'users'

    telegram_id: Mapped[int] = mapped_column(BigInteger,
                                             primary_key=True)  # Уникальный идентификатор пользователя в Telegram
    first_name: Mapped[str] = mapped_column(String, nullable=False)  # Имя пользователя
    username: Mapped[str] = mapped_column(String, nullable=True)  # Telegram username
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    cart: Mapped["Cart"] = relationship("Cart", back_populates="user", cascade="all, delete-orphan")



class Cart(Base):
    __tablename__ = 'carts'

    class ExecutedEnum(enum.Enum):
        look = "Корзина"
        execute = "Выполняется"
        complete = "Завершён"

    cart_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    products: Mapped[Dict[str, int]] = mapped_column(JSON)
    # cartItems: Mapped[list["CartItem"]] = relationship("CartItem", back_populates="cart",
    #                                                     cascade="all, delete-orphan")
    is_executed: Mapped[ExecutedEnum] = mapped_column(Enum(ExecutedEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('users.telegram_id'))
    user: Mapped["User"] = relationship("User", back_populates="cart")


# class CartItem(Base):
#     __tablename__ = 'cart_items'
#
#     cartItem_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     cart_id: Mapped[int] = mapped_column(Integer, ForeignKey('carts.cart_id'))
#     goods_id: Mapped[int] = mapped_column(Integer, ForeignKey('products.product_id'))
#     count: Mapped[int] = mapped_column(Integer)
#     cart: Mapped["Cart"]= relationship("Cart", back_populates="cartItems")
#     goods: Mapped["Product"] = relationship("Product", back_populates="cartItem")
