from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, func, Boolean, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from wood_app.database import Base


class Category(Base):
    __tablename__ = 'categories'

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True,
                                           autoincrement=True)
    title : Mapped[str] = mapped_column(String, nullable=False)
    image_url: Mapped[str] = mapped_column(String)
    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = 'products'

    product_id: Mapped[int] = mapped_column(Integer, primary_key=True,
                                           autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    describe: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    count: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column()
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('categories.category_id'))

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship("ProductImage", back_populates="product",
                                                        cascade="all, delete-orphan")


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
    # Связь с заявками (один пользователь может иметь несколько заявок)
    # orders: Mapped[list["Order"]] = relationship(back_populates="user")



# class Order(Base):
#     __tablename__ = 'orders'
#
#     order_id: Mapped[int] = mapped_column(Integer, primary_key=True,
#                                             autoincrement=True)
#     # products: Mapped[list["Product"]] = relationship("Product", back_populates="order")
#     created_at: Mapped[datetime] = mapped_column(server_default=func.now())
#     is_executed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
#     user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('users.telegram_id'))
#     user: Mapped["User"] = relationship("User", back_populates="orders")

    
