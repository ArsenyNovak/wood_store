from typing import Optional, List

from pydantic import BaseModel


class ImageBase64(BaseModel):
    name: str
    content: str  # base64 строка с префиксом "data:*/*;base64,..."

class ProductCreate(BaseModel):
    title: str
    describe: str
    count: int = 0
    price: float = 0.0
    category_id: int
    files: Optional[List[ImageBase64]] = []