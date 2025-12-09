import base64
import os
import uuid

from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, JSONResponse

from wood_app.api.models import Cart
from wood_app.api.forms import ProductCreate
from wood_app.bot.utils import cyrillicToLatin
from wood_app.bot.kbs import main_keyboard
from wood_app.config import settings
from wood_app.bot.create_bot import bot
from wood_app.api.dao import CategoryDAO, ProductDAO, ProductImageDAO, CartDAO

router_pages = APIRouter(prefix='/applications')
templates = Jinja2Templates(directory='wood_app/templates')


@router_pages.get("/", response_class=HTMLResponse)
async def read_root(request: Request, category: str = "all"):
    categories = await CategoryDAO.find_all()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "Kpama warmth_of_wood",
        "categories": categories,
        "selected_category": category,
    })


@router_pages.get("/api/products", response_class=JSONResponse)
async def get_products(category: str = "all"):
    if category != "all":
        products = await ProductDAO.find_all_with_images(category_id=int(category))
    else:
        products = await ProductDAO.find_all_with_images()
    return {"products": products}


@router_pages.post("/api/get_cart", response_class=JSONResponse)
async def load_cart(data):
    telegram_id = data.telegram_id
    cart = await CartDAO.find_one_or_none(user_id=telegram_id, is_executed=Cart.ExecutedEnum.look)
    return {"cart": cart}


@router_pages.get("/api/cart-products", response_class=JSONResponse)
async def cart_products(selected_products: str):
    selected_products = list(map(int, selected_products.split(",")))
    products = await ProductDAO.find_cart(selected_products)
    return {"products": products}


# @router_pages.post("/api/save_cart", response_class=JSONResponse)
# async def save_cart(data):
#     telegram_id = data.
#     cart = await CartDAO.find_one_or_none(user_id=telegram_id, is_executed=Cart.ExecutedEnum.look)
#     return {"cart": cart}


@router_pages.get("/create_products", response_class=HTMLResponse)
async def create_product(request: Request):
    categories = await CategoryDAO.find_all()

    return templates.TemplateResponse("create_products.html", {
        "request": request,
        "title": "Kpama warmth_of_wood",
        "categories": categories,
    })


@router_pages.post("/create_products", response_class=JSONResponse)
async def create_product(data: ProductCreate):
    new_catalog = cyrillicToLatin(data.title)
    count_catalog = 1
    while os.path.isdir(f"wood_app/static/image/products/{new_catalog}{count_catalog}"):
        count_catalog += 1
    new_catalog += str(count_catalog)
    base_upload_dir = f"wood_app/static/image/products/{new_catalog}"
    os.makedirs(base_upload_dir, exist_ok=True)

    new_product, new_id = await ProductDAO.add(
        title=data.title,
        describe=data.describe,
        unique=data.unique,
        price=data.price,
        category_id=data.category_id
    )

    saved_files_names = []
    countImages = 0
    for file in data.images:
        countImages += 1
        # Уберём префикс "data:image/png;base64," если есть
        header_removed = file.content.split(",")[1] if "," in file.content else file.content
        file_bytes = base64.b64decode(header_removed)
        ext = file.name.split(".")[-1]
        filename = f"{new_catalog}-{countImages}.{ext}"
        file_path = os.path.join(base_upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        saved_files_names.append(filename)
        file_path = file_path.replace("wood_app", "wood", 1)
        await ProductImageDAO.add(
            product_id=new_id,
            url=file_path
        )

    kb = main_keyboard(user_id=settings.ADMIN_ID, first_name="ARSENI")
    message = "🎉 <b>Изделие успешно добавлено в каталог!</b>\n\n"
    await bot.send_message(chat_id=settings.ADMIN_ID, text=message, reply_markup=kb)

    return {"message": "success!"}
