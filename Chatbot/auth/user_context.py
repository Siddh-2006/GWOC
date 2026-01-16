from pydantic import BaseModel
from typing import Optional

class UserContext(BaseModel):
    is_authenticated: bool = False
    user_id: Optional[str] = None
    role: Optional[str] = "guest"
