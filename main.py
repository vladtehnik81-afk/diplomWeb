from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from pydantic import BaseModel, EmailStr
import hashlib
import hmac
import time
import json
import base64
import os
from sqlalchemy import create_engine
from db.database import get_db, engine
from db.models import Base, University, Score, User, Favorite

# 1. Сначала создаем экземпляр FastAPI
app = FastAPI(title="ЕГЭ Поступление API", version="1.0.0")

# 2. Настраиваем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Если нужно ограничить: ["https://твое-приложение.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Настройка базы данных
DATABASE_URL = os.getenv("DATABASE_URL")
# Создаём таблицы при старте
Base.metadata.create_all(bind=engine)

SECRET_KEY = "ege_diplom_secret_2025"
security   = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token(user_id: int) -> str:
    payload = json.dumps({"user_id": user_id, "exp": int(time.time()) + 86400 * 30})
    encoded = base64.b64encode(payload.encode()).decode()
    sig     = hmac.new(SECRET_KEY.encode(), encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{sig}"


def verify_token(token: str) -> int | None:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        encoded, sig = parts
        expected = hmac.new(SECRET_KEY.encode(), encoded.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.b64decode(encoded).decode())
        if payload["exp"] < time.time():
            return None
        return payload["user_id"]
    except Exception:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    user_id = verify_token(credentials.credentials)
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()


def require_user(user: User | None = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status_code=401, detail="Необходима авторизация")
    return user

LATEST_YEAR = 2024


# ─── Схемы ответов ────────────────────────────────────────────────────────────

class ScoreOut(BaseModel):
    year:           int
    min_score:      Optional[int]
    avg_score:      Optional[int]
    min_score_paid: Optional[int]
    tuition_fee:    Optional[int]
    budget_places:  Optional[int]

    class Config:
        from_attributes = True


class UniversityOut(BaseModel):
    id:         int
    name:       str
    short_name: Optional[str]
    city:       Optional[str]
    direction:  Optional[str]
    website:    Optional[str]
    tag:        Optional[str]
    tag_color:  Optional[str]
    rating:     Optional[int]
    # Баллы последнего года
    min_score:      Optional[int] = None
    avg_score:      Optional[int] = None
    min_score_paid: Optional[int] = None
    tuition_fee:    Optional[int] = None
    budget_places:  Optional[int] = None
    score_history:  list[int]     = []

    class Config:
        from_attributes = True


# ─── Хелпер ──────────────────────────────────────────────────────────────────

def enrich(uni: University) -> dict:
    """Добавляет к вузу баллы последнего года и историю"""
    data = {
        "id":         uni.id,
        "name":       uni.name,
        "short_name": uni.short_name,
        "city":       uni.city,
        "direction":  uni.direction,
        "website":    uni.website,
        "tag":        uni.tag,
        "tag_color":  uni.tag_color,
        "rating":     uni.rating,
        "min_score":      None,
        "avg_score":      None,
        "min_score_paid": None,
        "tuition_fee":    None,
        "budget_places":  None,
        "score_history":  [],
    }

    scores_sorted = sorted(uni.scores, key=lambda s: s.year)

    # История avg_score по годам
    data["score_history"] = [s.avg_score for s in scores_sorted if s.avg_score]

    # Последний год
    latest = next((s for s in reversed(scores_sorted) if s.year == LATEST_YEAR), None)
    if not latest and scores_sorted:
        latest = scores_sorted[-1]

    if latest:
        data["min_score"]      = latest.min_score
        data["avg_score"]      = latest.avg_score
        data["min_score_paid"] = latest.min_score_paid
        data["tuition_fee"]    = latest.tuition_fee
        data["budget_places"]  = latest.budget_places

    return data


# ─── Эндпоинты ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "ЕГЭ Поступление API работает"}


@app.get("/universities", response_model=list[UniversityOut])
def get_universities(
    city:      Optional[str] = Query(None),
    direction: Optional[str] = Query(None),
    search:    Optional[str] = Query(None),
    sort_by:   str           = Query("rating"),
    db:        Session       = Depends(get_db),
):
    """Список всех вузов с фильтрацией"""
    q = db.query(University)

    if city:
        q = q.filter(University.city == city)
    if direction:
        q = q.filter(University.direction == direction)
    if search:
        q = q.filter(University.name.ilike(f"%{search}%"))

    unis = q.all()
    result = [enrich(u) for u in unis]

    # Сортировка
    if sort_by == "rating":
        result.sort(key=lambda x: x["rating"] or 999)
    elif sort_by == "score":
        result.sort(key=lambda x: x["avg_score"] or 0, reverse=True)
    elif sort_by == "places":
        result.sort(key=lambda x: x["budget_places"] or 0, reverse=True)
    elif sort_by == "price":
        result.sort(key=lambda x: x["tuition_fee"] or 999999)

    return result


@app.get("/universities/{uni_id}", response_model=UniversityOut)
def get_university(uni_id: int, db: Session = Depends(get_db)):
    """Один вуз по ID"""
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="Вуз не найден")
    return enrich(uni)


@app.get("/universities/{uni_id}/scores", response_model=list[ScoreOut])
def get_scores(uni_id: int, db: Session = Depends(get_db)):
    """История баллов вуза по годам"""
    scores = (
        db.query(Score)
        .filter(Score.university_id == uni_id)
        .order_by(Score.year)
        .all()
    )
    return scores


@app.get("/search", response_model=list[UniversityOut])
def search_by_score(
    total:     int           = Query(..., description="Сумма баллов ЕГЭ"),
    form_type: str           = Query("all", description="all | budget | paid"),
    city:      Optional[str] = Query(None),
    direction: Optional[str] = Query(None),
    sort_by:   str           = Query("match"),
    db:        Session       = Depends(get_db),
):
    """Подбор вузов по сумме баллов"""
    unis = db.query(University).all()
    result = [enrich(u) for u in unis]

    # Фильтр по форме обучения
    if form_type == "budget":
        result = [u for u in result if u["min_score"] and total >= u["min_score"]]
    elif form_type == "paid":
        result = [u for u in result if u["min_score_paid"] and u["min_score"]
                  and total >= u["min_score_paid"] and total < u["min_score"]]

    if city:
        result = [u for u in result if u["city"] == city]
    if direction:
        result = [u for u in result if u["direction"] == direction]

    # Сортировка
    def match_rank(u):
        ms  = u["avg_score"]  or 999
        msp = u["min_score"]  or 999
        if total >= ms:  return 0
        if total >= msp: return 1
        return 2

    if sort_by == "match":
        result.sort(key=lambda u: (match_rank(u), -(u["avg_score"] or 0)))
    elif sort_by == "score":
        result.sort(key=lambda u: u["avg_score"] or 0, reverse=True)
    elif sort_by == "places":
        result.sort(key=lambda u: u["budget_places"] or 0, reverse=True)
    elif sort_by == "price":
        result.sort(key=lambda u: u["tuition_fee"] or 999999)
    elif sort_by == "rating":
        result.sort(key=lambda u: u["rating"] or 999)

    return result


@app.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    """Список городов"""
    rows = db.query(University.city).distinct().filter(University.city != None).all()
    return sorted([r[0] for r in rows])


@app.get("/directions")
def get_directions(db: Session = Depends(get_db)):
    """Список направлений"""
    rows = db.query(University.direction).distinct().filter(University.direction != None).all()
    return sorted([r[0] for r in rows])


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Общая статистика"""
    total_unis   = db.query(func.count(University.id)).scalar()
    total_scores = db.query(func.count(Score.id)).scalar()
    cities       = db.query(func.count(func.distinct(University.city))).scalar()
    return {
        "universities": total_unis,
        "score_records": total_scores,
        "cities": cities,
    }


# ─── Авторизация ─────────────────────────────────────────────────────────────

class RegisterIn(BaseModel):
    name:     str
    email:    str
    password: str

class LoginIn(BaseModel):
    email:    str
    password: str

class UserOut(BaseModel):
    id:    int
    name:  str
    email: str
    class Config:
        from_attributes = True


@app.post("/auth/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Пароль минимум 6 символов")
    user = User(
        name     = data.name.strip(),
        email    = data.email.lower().strip(),
        password = hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": make_token(user.id), "user": UserOut.from_orm(user)}


@app.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or user.password != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return {"token": make_token(user.id), "user": UserOut.from_orm(user)}


@app.get("/me", response_model=UserOut)
def get_me(user: User = Depends(require_user)):
    return user


# ─── Избранное ───────────────────────────────────────────────────────────────

@app.get("/favorites")
def get_favorites(user: User = Depends(require_user), db: Session = Depends(get_db)):
    """Список избранных вузов пользователя"""
    favs = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    uni_ids = [f.university_id for f in favs]
    unis = db.query(University).filter(University.id.in_(uni_ids)).all()
    return [enrich(u) for u in unis]


@app.post("/favorites/{uni_id}")
def add_favorite(uni_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)):
    """Добавить вуз в избранное"""
    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="Вуз не найден")
    existing = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.university_id == uni_id
    ).first()
    if existing:
        return {"status": "already_exists"}
    db.add(Favorite(user_id=user.id, university_id=uni_id))
    db.commit()
    return {"status": "added"}


@app.delete("/favorites/{uni_id}")
def remove_favorite(uni_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)):
    """Убрать вуз из избранного"""
    fav = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.university_id == uni_id
    ).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"status": "removed"}


@app.get("/favorites/ids")
def get_favorite_ids(user: User = Depends(require_user), db: Session = Depends(get_db)):
    """Список ID избранных вузов"""
    favs = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    return [f.university_id for f in favs]


@app.get("/universities/{uni_id}/photo")
def get_university_photo(uni_id: int, db: Session = Depends(get_db)):
    """Берёт фото вуза с postupi.online по slug"""
    import httpx
    from bs4 import BeautifulSoup

    uni = db.query(University).filter(University.id == uni_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="Вуз не найден")

    # Если фото уже есть в БД — возвращаем сразу
    if uni.photo_url:
        return {"photo_url": uni.photo_url}

    # Если нет slug — не можем найти фото
    if not uni.slug:
        return {"photo_url": None}

    try:
        with httpx.Client(timeout=15, follow_redirects=True) as client:
            url = f"https://postupi.online/vuz/{uni.slug}/"
            r = client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            r.encoding = "windows-1251"
            soup = BeautifulSoup(r.text, "html.parser")

            # Ищем og:image — главное фото страницы
            og = soup.find("meta", property="og:image")
            if og and og.get("content"):
                photo_url = og["content"]
                # Сохраняем в БД чтобы не парсить повторно
                uni.photo_url = photo_url
                db.commit()
                return {"photo_url": photo_url}

            # Запасной вариант — ищем img с классом вуза
            for sel in ["[class*='vuz-photo']", "[class*='university-img']", "[class*='hero'] img", "main img"]:
                img = soup.select_one(sel)
                if img and img.get("src"):
                    src = img["src"]
                    if not src.startswith("http"):
                        src = "https://postupi.online" + src
                    uni.photo_url = src
                    db.commit()
                    return {"photo_url": src}

    except Exception as e:
        print(f"[PHOTO ERROR] {uni.name}: {e}")

    return {"photo_url": None}