"""
Парсер сайта postupi.online
Запуск: python -m parser.parser 10
"""

import re
import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal, engine
from db.models import Base, University, Score
from playwright.sync_api import sync_playwright

BASE_URL = "https://postupi.online"

DIRECTION_MAP = {
    "информатик":     "IT и программирование",
    "программирован": "IT и программирование",
    "математик":      "Естественные науки",
    "физик":          "Естественные науки",
    "хими":           "Естественные науки",
    "биолог":         "Естественные науки",
    "эконом":         "Экономика и управление",
    "менеджмент":     "Экономика и управление",
    "юрид":           "Юриспруденция",
    "правов":         "Юриспруденция",
    "медицин":        "Медицина",
    "педагог":        "Педагогика",
    "инженер":        "Инженерия",
    "технич":         "Инженерия",
    "машиностроен":   "Инженерия",
    "истори":         "Гуманитарные науки",
    "филолог":        "Гуманитарные науки",
    "лингвист":       "Гуманитарные науки",
}

TAG_MAP = {
    "Москва":          ("Топ",          "blue"),
    "Санкт-Петербург": ("Топ",          "blue"),
    "Казань":          ("Региональный", "teal"),
    "Екатеринбург":    ("Региональный", "teal"),
    "Новосибирск":     ("Региональный", "teal"),
    "Томск":           ("Региональный", "teal"),
    "Нижний Новгород": ("Региональный", "teal"),
    "Воронеж":         ("Региональный", "teal"),
    "Самара":          ("Региональный", "teal"),
    "Ростов-на-Дону":  ("Региональный", "teal"),
    "Красноярск":      ("Региональный", "teal"),
    "Пермь":           ("Региональный", "teal"),
    "Омск":            ("Региональный", "teal"),
    "Уфа":             ("Региональный", "teal"),
    "Челябинск":       ("Региональный", "teal"),
    "Саратов":         ("Региональный", "teal"),
    "Волгоград":       ("Региональный", "teal"),
    "Красноярск":      ("Региональный", "teal"),
    "Иркутск":         ("Региональный", "teal"),
    "Владивосток":     ("Региональный", "teal"),
}

YEAR = 2024


def parse_int(text: str) -> int | None:
    if not text:
        return None
    digits = re.sub(r"[^\d]", "", str(text))
    return int(digits) if digits else None


def guess_direction(name: str) -> str:
    name_lower = name.lower()
    for keyword, direction in DIRECTION_MAP.items():
        if keyword in name_lower:
            return direction
    return "Широкий профиль"


def get_page_url(page: int) -> str:
    if page == 1:
        return f"{BASE_URL}/vuzi/"
    return f"{BASE_URL}/vuzi/?page_num={page}"


def get_slugs_from_page(page_obj, page: int) -> list[str]:
    """Собирает slug'и вузов со страницы списка"""
    url = get_page_url(page)
    print(f"  Загружаем список: {url}")

    try:
        page_obj.goto(url, wait_until="domcontentloaded", timeout=30000)
        page_obj.wait_for_timeout(3000)
    except Exception as e:
        print(f"  [ОШИБКА] {e}")
        return []

    slugs = []
    seen  = set()

    links = page_obj.query_selector_all("a[href*='/vuz/']")
    for link in links:
        href = link.get_attribute("href") or ""
        # Берём только /vuz/slug/ без поддомена
        m = re.search(r"/vuz/([^/]+)/?$", href)
        if not m:
            continue
        slug = m.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        slugs.append(slug)

    print(f"  Найдено slug'ов: {len(slugs)}")
    return slugs


def parse_university_page(page_obj, slug: str) -> dict | None:
    """Открывает страницу вуза и собирает все данные"""
    url = f"{BASE_URL}/vuz/{slug}/"
    try:
        page_obj.goto(url, wait_until="domcontentloaded", timeout=20000)
        page_obj.wait_for_timeout(1500)
    except Exception as e:
        print(f"    [ОШИБКА загрузки] {e}")
        return None

    # Реальный URL после редиректа (там будет поддомен с городом)
    real_url = page_obj.url
    print(f"    URL: {real_url}")

    result = {"slug": slug, "url": real_url}

    # Название — из <h1> или <title>
    h1 = page_obj.query_selector("h1")
    if h1:
        result["name"] = h1.inner_text().strip()
    else:
        title = page_obj.title()
        # Убираем суффикс типа " — поступи.онлайн"
        name = re.split(r"\s*[|:—–-]\s*", title)[0].strip()
        result["name"] = name

    if not result.get("name") or len(result["name"]) < 3:
        return None

    text_all = page_obj.inner_text("body")

    # Город — из хлебных крошек, мета или поддомена
    city = ""
    city_el = (
        page_obj.query_selector("[itemprop='addressLocality']") or
        page_obj.query_selector("[class*='city']") or
        page_obj.query_selector("[class*='location']") or
        page_obj.query_selector("[class*='gorod']")
    )
    if city_el:
        city = city_el.inner_text().strip()

    # Если город не нашли — попробуем из поддомена
    if not city:
        subdomain_match = re.match(r"https?://([^.]+)\.postupi\.online", real_url)
        if subdomain_match:
            subdomain = subdomain_match.group(1)
            # Словарь поддоменов → города
            SUBDOMAIN_CITY = {
                "msk": "Москва", "spb": "Санкт-Петербург",
                "kazan": "Казань", "ekb": "Екатеринбург",
                "nsk": "Новосибирск", "tomsk": "Томск",
                "nn": "Нижний Новгород", "vrn": "Воронеж",
                "samara": "Самара", "rostov": "Ростов-на-Дону",
                "krasnoyarsk": "Красноярск", "perm": "Пермь",
                "omsk": "Омск", "ufa": "Уфа",
                "chelyabinsk": "Челябинск", "saratov": "Саратов",
                "volgograd": "Волгоград", "irkutsk": "Иркутск",
                "vladivostok": "Владивосток", "sevastopol": "Севастополь",
            }
            city = SUBDOMAIN_CITY.get(subdomain, "")

    result["city"] = city

    # Официальный сайт
    for a in page_obj.query_selector_all("a[href^='http']"):
        href = a.get_attribute("href") or ""
        if ("postupi" not in href and "vk.com" not in href
                and "t.me" not in href and len(href) > 10):
            result["website"] = href
            break

    # Баллы ЕГЭ
    nums = [int(n) for n in re.findall(r"\b(\d{3})\b", text_all) if 150 <= int(n) <= 300]
    if nums:
        result["min_score"] = min(nums)
        result["avg_score"] = max(nums)

    # Стоимость обучения
    for m in re.findall(r"(\d[\d\s]{4,8})\s*(?:руб|₽|р\.)", text_all):
        val = parse_int(m)
        if val and 50000 <= val <= 1000000:
            result["tuition_fee"] = val
            break

    # Бюджетные места
    for m in re.findall(r"(\d{2,5})\s*(?:бюджетных места|бюджетных мест|бюджетных)", text_all):
        val = int(m)
        if 10 <= val <= 20000:
            result["budget_places"] = val
            break

    return result


def save_university(db, data: dict, rating: int) -> None:
    name      = data["name"]
    city      = data.get("city", "")
    direction = guess_direction(name)
    tag, tag_color = TAG_MAP.get(city, ("Региональный", "teal"))

    short_name = re.split(r"[,\(«]", name)[0].strip()
    if len(short_name) > 30:
        words = short_name.split()
        short_name = " ".join(words[:2]) if len(words) >= 2 else short_name[:20]

    uni = db.query(University).filter(University.name == name).first()
    if not uni:
        uni = University(
            name=name, short_name=short_name, city=city,
            direction=direction, website=data.get("website", ""),
            tag=tag, tag_color=tag_color, rating=rating,
        )
        db.add(uni)
        db.flush()
        print(f"  [+] {name[:70]}")
    else:
        if city:
            uni.city = city
        uni.direction = direction
        if data.get("website"):
            uni.website = data["website"]
        print(f"  [~] {name[:70]}")

    min_score = data.get("min_score") or 180
    avg_score = data.get("avg_score") or (min_score + 15)
    tuition   = data.get("tuition_fee") or 200000
    places    = data.get("budget_places") or 300
    min_paid  = max(100, min_score - 60)

    existing = db.query(Score).filter(
        Score.university_id == uni.id,
        Score.year == YEAR
    ).first()

    if not existing:
        db.add(Score(
            university_id=uni.id, year=YEAR,
            min_score=min_score, avg_score=avg_score,
            min_score_paid=min_paid, tuition_fee=tuition,
            budget_places=places,
        ))
    else:
        existing.min_score      = min_score
        existing.avg_score      = avg_score
        existing.min_score_paid = min_paid
        existing.tuition_fee    = tuition
        existing.budget_places  = places

    db.commit()


def run_parser(max_pages: int = 5) -> None:
    print("=" * 55)
    print("Запуск парсера postupi.online (Playwright)")
    print("=" * 55)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    total = 0
    rating_start = db.query(University).count() + 1

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            )
            list_page   = context.new_page()
            detail_page = context.new_page()

            for page_num in range(1, max_pages + 1):
                print(f"\n── Страница {page_num}/{max_pages} ──")
                slugs = get_slugs_from_page(list_page, page_num)

                if not slugs:
                    print("  Нет slug'ов — завершаем")
                    break

                for slug in slugs:
                    print(f"\n  → {slug}")
                    data = parse_university_page(detail_page, slug)
                    if not data:
                        print("    Пропускаем")
                        continue

                    save_university(db, data, rating_start + total)
                    total += 1
                    time.sleep(1)

                print(f"\n  Страница {page_num} готова. Всего: {total}")
                time.sleep(2)

            browser.close()

    except KeyboardInterrupt:
        print("\nОстановлено (Ctrl+C)")
    finally:
        db.close()

    print(f"\n{'=' * 55}")
    print(f"Готово! Добавлено/обновлено: {total} вузов")
    print("=" * 55)


if __name__ == "__main__":
    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    run_parser(max_pages=pages)