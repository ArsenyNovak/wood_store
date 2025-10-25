import os
from typing import List

from fastapi import APIRouter, Form, File, UploadFile
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, JSONResponse

from wood_app.bot.kbs import main_keyboard
from wood_app.config import settings
from wood_app.bot.create_bot import bot
from wood_app.api.dao import CategoryDAO, ProductDAO, ProductImageDAO

router_pages = APIRouter(prefix='/applications')
templates = Jinja2Templates(directory='wood_app/templates')


@router_pages.get("/", response_class=HTMLResponse)
async def read_root(request: Request, category: str = "all"):
    categories = await CategoryDAO.find_all()
    if category != "all":
        products = await ProductDAO.find_all(category_id=int(category))
    else:
        products = await ProductDAO.find_all()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "Kpama warmth_of_wood",
        "categories": categories,
        "products": products,
        "selected_category": category,
    })


@router_pages.get("/create_products", response_class=HTMLResponse)
async def create_product(request: Request):
    categories = await CategoryDAO.find_all()

    return templates.TemplateResponse("create_products.html", {
        "request": request,
        "title": "Kpama warmth_of_wood",
        "categories": categories,
    })


@router_pages.post("/upload_files", response_class=JSONResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    base_upload_dir = "static/image/products"
    os.makedirs(base_upload_dir, exist_ok=True)
    print(files)
    saved_files = []

    for file in files:
        file_path = os.path.join(base_upload_dir, file.filename)
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        saved_files.append({"name": file.filename, "path": file_path})
    print(saved_files)
    return {"files": saved_files}


@router_pages.post("/create_products", response_class=JSONResponse)
async def create_product(
        request: Request,
):
    data = await request.json()

    title = data.get("title")
    describe = data.get("describe")
    count = int(data.get("count", 0))
    price = float(data.get("price", 0))
    category_id = int(data.get("category_id"))
    images = data.get("images", [])  # список имен или путей загрузленных файлов

    new_product, new_id = await ProductDAO.add(
        title=title,
        describe=describe,
        count=count,
        price=price,
        category_id=category_id
    )

    # Связываем загруженные файлы с продуктом
    for image_info in images:
        # используем image_info как имя файла или путь, зависит как передаёте из JS
        url_path = os.path.join("static/image/products", image_info)
        await ProductImageDAO.add(
            product_id=new_id,
            url=url_path
        )

    kb = main_keyboard(user_id=settings.ADMIN_ID, first_name="ARSENI")
    message = "🎉 <b>Изделие успешно добавлено в каталог!</b>\n\n"
    await bot.send_message(chat_id=settings.ADMIN_ID, text=message, reply_markup=kb)

    return {"message": "success!"}
