from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

# Settings Models
class SettingsBase(BaseModel):
    name: str = "NeuroVita"
    tagline: str = "Memória Afiada, Energia Plena"
    description: str = "Suplemento natural para potencializar sua memória e disposição diária."
    phone: str = "(11) 99999-9999"
    email: str = "contato@neurovita.com.br"
    instagram: str = "@neurovita"
    paymentLink: str = ""

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    instagram: Optional[str] = None
    paymentLink: Optional[str] = None

class SettingsResponse(SettingsBase):
    id: str = Field(alias="_id")
    updatedAt: datetime

    class Config:
        populate_by_name = True

# Product Images Models
class ProductImagesBase(BaseModel):
    main: str = "https://images.unsplash.com/photo-1763668331599-487470fb85b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85"
    secondary: str = "https://images.unsplash.com/photo-1763668444855-401b58dceb20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85"
    tertiary: str = "https://images.unsplash.com/photo-1763668177859-0ed5669a795e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85"

class ProductImagesUpdate(BaseModel):
    main: Optional[str] = None
    secondary: Optional[str] = None
    tertiary: Optional[str] = None

class ProductImagesResponse(ProductImagesBase):
    id: str = Field(alias="_id")
    updatedAt: datetime

    class Config:
        populate_by_name = True

# Order Models
class OrderCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    cep: str
    address: str
    number: str
    complement: Optional[str] = ""
    neighborhood: str
    city: str
    state: str
    quantity: int = Field(ge=1, le=3)
    productPrice: float
    shippingPrice: float
    totalPrice: float

class OrderResponse(BaseModel):
    id: str = Field(alias="_id")
    orderNumber: str
    name: str
    email: str
    phone: str
    cep: str
    address: str
    number: str
    complement: Optional[str] = ""
    neighborhood: str
    city: str
    state: str
    quantity: int
    productPrice: float
    shippingPrice: float
    totalPrice: float
    status: OrderStatus
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
