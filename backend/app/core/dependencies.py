from fastapi import HTTPException, Header
from .database import db


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token not provided")

    token = authorization.replace("Bearer ", "")
    user_id = db.tokens.get(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.users.get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
