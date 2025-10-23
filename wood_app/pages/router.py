from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse

from wood_app.api.dao import CategoryDAO, ProductDAO



router_pages = APIRouter(prefix='/applications', tags=['Фронтенд'])
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


