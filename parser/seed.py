"""
Заливка начальных данных в БД из наших mock-данных.
Запуск: python -m parser.seed

Используй это ВМЕСТО парсера если хочешь быстро наполнить БД
готовыми данными без парсинга.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal, engine
from db.models import Base, University, Score

SEED_DATA = [
    {
        "name": "МГУ им. М.В. Ломоносова", "short_name": "МГУ",
        "city": "Москва", "direction": "Гуманитарные науки",
        "website": "https://msu.ru", "tag": "Топ-5", "tag_color": "blue", "rating": 1,
        "scores": [
            {"year": 2019, "min_score": 248, "avg_score": 258, "min_score_paid": 195, "tuition_fee": 320000, "budget_places": 3000},
            {"year": 2020, "min_score": 255, "avg_score": 265, "min_score_paid": 200, "tuition_fee": 335000, "budget_places": 3100},
            {"year": 2021, "min_score": 261, "avg_score": 271, "min_score_paid": 205, "tuition_fee": 350000, "budget_places": 3150},
            {"year": 2022, "min_score": 268, "avg_score": 276, "min_score_paid": 208, "tuition_fee": 360000, "budget_places": 3200},
            {"year": 2023, "min_score": 272, "avg_score": 280, "min_score_paid": 210, "tuition_fee": 370000, "budget_places": 3200},
            {"year": 2024, "min_score": 265, "avg_score": 278, "min_score_paid": 210, "tuition_fee": 380000, "budget_places": 3200},
        ]
    },
    {
        "name": "НИУ «Высшая школа экономики»", "short_name": "НИУ ВШЭ",
        "city": "Москва", "direction": "Экономика и управление",
        "website": "https://hse.ru", "tag": "Топ-10", "tag_color": "blue", "rating": 2,
        "scores": [
            {"year": 2019, "min_score": 230, "avg_score": 240, "min_score_paid": 185, "tuition_fee": 380000, "budget_places": 2600},
            {"year": 2020, "min_score": 238, "avg_score": 248, "min_score_paid": 190, "tuition_fee": 400000, "budget_places": 2700},
            {"year": 2021, "min_score": 244, "avg_score": 254, "min_score_paid": 193, "tuition_fee": 420000, "budget_places": 2750},
            {"year": 2022, "min_score": 251, "avg_score": 260, "min_score_paid": 197, "tuition_fee": 435000, "budget_places": 2800},
            {"year": 2023, "min_score": 256, "avg_score": 264, "min_score_paid": 199, "tuition_fee": 445000, "budget_places": 2800},
            {"year": 2024, "min_score": 250, "avg_score": 261, "min_score_paid": 200, "tuition_fee": 450000, "budget_places": 2800},
        ]
    },
    {
        "name": "МГТУ им. Н.Э. Баумана", "short_name": "МГТУ",
        "city": "Москва", "direction": "Инженерия",
        "website": "https://bmstu.ru", "tag": "Инженерия", "tag_color": "amber", "rating": 3,
        "scores": [
            {"year": 2019, "min_score": 210, "avg_score": 222, "min_score_paid": 168, "tuition_fee": 270000, "budget_places": 4200},
            {"year": 2020, "min_score": 216, "avg_score": 228, "min_score_paid": 172, "tuition_fee": 285000, "budget_places": 4300},
            {"year": 2021, "min_score": 222, "avg_score": 234, "min_score_paid": 175, "tuition_fee": 300000, "budget_places": 4400},
            {"year": 2022, "min_score": 229, "avg_score": 240, "min_score_paid": 178, "tuition_fee": 310000, "budget_places": 4500},
            {"year": 2023, "min_score": 235, "avg_score": 244, "min_score_paid": 180, "tuition_fee": 315000, "budget_places": 4500},
            {"year": 2024, "min_score": 228, "avg_score": 241, "min_score_paid": 180, "tuition_fee": 320000, "budget_places": 4500},
        ]
    },
    {
        "name": "Санкт-Петербургский государственный университет", "short_name": "СПбГУ",
        "city": "Санкт-Петербург", "direction": "Гуманитарные науки",
        "website": "https://spbu.ru", "tag": "Топ-5", "tag_color": "blue", "rating": 4,
        "scores": [
            {"year": 2019, "min_score": 220, "avg_score": 232, "min_score_paid": 178, "tuition_fee": 285000, "budget_places": 2400},
            {"year": 2020, "min_score": 228, "avg_score": 240, "min_score_paid": 183, "tuition_fee": 300000, "budget_places": 2500},
            {"year": 2021, "min_score": 234, "avg_score": 246, "min_score_paid": 186, "tuition_fee": 315000, "budget_places": 2550},
            {"year": 2022, "min_score": 240, "avg_score": 252, "min_score_paid": 189, "tuition_fee": 328000, "budget_places": 2600},
            {"year": 2023, "min_score": 247, "avg_score": 257, "min_score_paid": 191, "tuition_fee": 336000, "budget_places": 2600},
            {"year": 2024, "min_score": 238, "avg_score": 252, "min_score_paid": 190, "tuition_fee": 340000, "budget_places": 2600},
        ]
    },
    {
        "name": "Университет ИТМО", "short_name": "ИТМО",
        "city": "Санкт-Петербург", "direction": "IT и программирование",
        "website": "https://itmo.ru", "tag": "IT", "tag_color": "green", "rating": 5,
        "scores": [
            {"year": 2019, "min_score": 228, "avg_score": 238, "min_score_paid": 182, "tuition_fee": 300000, "budget_places": 1600},
            {"year": 2020, "min_score": 235, "avg_score": 245, "min_score_paid": 186, "tuition_fee": 318000, "budget_places": 1700},
            {"year": 2021, "min_score": 241, "avg_score": 251, "min_score_paid": 189, "tuition_fee": 335000, "budget_places": 1750},
            {"year": 2022, "min_score": 248, "avg_score": 257, "min_score_paid": 193, "tuition_fee": 348000, "budget_places": 1800},
            {"year": 2023, "min_score": 254, "avg_score": 262, "min_score_paid": 195, "tuition_fee": 355000, "budget_places": 1800},
            {"year": 2024, "min_score": 248, "avg_score": 259, "min_score_paid": 195, "tuition_fee": 360000, "budget_places": 1800},
        ]
    },
    {
        "name": "Казанский федеральный университет", "short_name": "КФУ",
        "city": "Казань", "direction": "Естественные науки",
        "website": "https://kpfu.ru", "tag": "Региональный", "tag_color": "teal", "rating": 6,
        "scores": [
            {"year": 2019, "min_score": 178, "avg_score": 192, "min_score_paid": 138, "tuition_fee": 148000, "budget_places": 4800},
            {"year": 2020, "min_score": 185, "avg_score": 199, "min_score_paid": 143, "tuition_fee": 158000, "budget_places": 4900},
            {"year": 2021, "min_score": 191, "avg_score": 206, "min_score_paid": 147, "tuition_fee": 165000, "budget_places": 5000},
            {"year": 2022, "min_score": 198, "avg_score": 213, "min_score_paid": 150, "tuition_fee": 172000, "budget_places": 5100},
            {"year": 2023, "min_score": 206, "avg_score": 219, "min_score_paid": 152, "tuition_fee": 178000, "budget_places": 5100},
            {"year": 2024, "min_score": 195, "avg_score": 214, "min_score_paid": 150, "tuition_fee": 180000, "budget_places": 5100},
        ]
    },
    {
        "name": "Уральский федеральный университет", "short_name": "УрФУ",
        "city": "Екатеринбург", "direction": "Инженерия",
        "website": "https://urfu.ru", "tag": "Региональный", "tag_color": "teal", "rating": 7,
        "scores": [
            {"year": 2019, "min_score": 172, "avg_score": 186, "min_score_paid": 133, "tuition_fee": 140000, "budget_places": 6400},
            {"year": 2020, "min_score": 179, "avg_score": 193, "min_score_paid": 138, "tuition_fee": 150000, "budget_places": 6500},
            {"year": 2021, "min_score": 185, "avg_score": 200, "min_score_paid": 142, "tuition_fee": 158000, "budget_places": 6600},
            {"year": 2022, "min_score": 192, "avg_score": 207, "min_score_paid": 145, "tuition_fee": 163000, "budget_places": 6700},
            {"year": 2023, "min_score": 198, "avg_score": 212, "min_score_paid": 146, "tuition_fee": 168000, "budget_places": 6800},
            {"year": 2024, "min_score": 188, "avg_score": 205, "min_score_paid": 145, "tuition_fee": 170000, "budget_places": 6800},
        ]
    },
    {
        "name": "Российский университет дружбы народов", "short_name": "РУДН",
        "city": "Москва", "direction": "Юриспруденция",
        "website": "https://rudn.ru", "tag": "Международный", "tag_color": "amber", "rating": 8,
        "scores": [
            {"year": 2019, "min_score": 195, "avg_score": 208, "min_score_paid": 152, "tuition_fee": 238000, "budget_places": 1900},
            {"year": 2020, "min_score": 201, "avg_score": 214, "min_score_paid": 156, "tuition_fee": 252000, "budget_places": 2000},
            {"year": 2021, "min_score": 207, "avg_score": 220, "min_score_paid": 160, "tuition_fee": 265000, "budget_places": 2000},
            {"year": 2022, "min_score": 213, "avg_score": 226, "min_score_paid": 163, "tuition_fee": 276000, "budget_places": 2100},
            {"year": 2023, "min_score": 220, "avg_score": 231, "min_score_paid": 165, "tuition_fee": 285000, "budget_places": 2100},
            {"year": 2024, "min_score": 210, "avg_score": 226, "min_score_paid": 165, "tuition_fee": 290000, "budget_places": 2100},
        ]
    },
    {
        "name": "Новосибирский государственный университет", "short_name": "НГУ",
        "city": "Новосибирск", "direction": "Естественные науки",
        "website": "https://nsu.ru", "tag": "Наука", "tag_color": "purple", "rating": 9,
        "scores": [
            {"year": 2019, "min_score": 202, "avg_score": 215, "min_score_paid": 160, "tuition_fee": 172000, "budget_places": 1450},
            {"year": 2020, "min_score": 208, "avg_score": 221, "min_score_paid": 164, "tuition_fee": 182000, "budget_places": 1500},
            {"year": 2021, "min_score": 214, "avg_score": 227, "min_score_paid": 168, "tuition_fee": 192000, "budget_places": 1550},
            {"year": 2022, "min_score": 221, "avg_score": 233, "min_score_paid": 172, "tuition_fee": 200000, "budget_places": 1580},
            {"year": 2023, "min_score": 228, "avg_score": 238, "min_score_paid": 174, "tuition_fee": 207000, "budget_places": 1600},
            {"year": 2024, "min_score": 220, "avg_score": 234, "min_score_paid": 175, "tuition_fee": 210000, "budget_places": 1600},
        ]
    },
    {
        "name": "МИФИ — Национальный исследовательский ядерный университет", "short_name": "МИФИ",
        "city": "Москва", "direction": "IT и программирование",
        "website": "https://mephi.ru", "tag": "Топ-10", "tag_color": "blue", "rating": 10,
        "scores": [
            {"year": 2019, "min_score": 222, "avg_score": 234, "min_score_paid": 178, "tuition_fee": 258000, "budget_places": 1750},
            {"year": 2020, "min_score": 229, "avg_score": 240, "min_score_paid": 182, "tuition_fee": 272000, "budget_places": 1800},
            {"year": 2021, "min_score": 235, "avg_score": 246, "min_score_paid": 185, "tuition_fee": 286000, "budget_places": 1850},
            {"year": 2022, "min_score": 241, "avg_score": 252, "min_score_paid": 188, "tuition_fee": 298000, "budget_places": 1900},
            {"year": 2023, "min_score": 248, "avg_score": 257, "min_score_paid": 190, "tuition_fee": 306000, "budget_places": 1900},
            {"year": 2024, "min_score": 240, "avg_score": 253, "min_score_paid": 190, "tuition_fee": 310000, "budget_places": 1900},
        ]
    },
]


def run_seed():
    print("=" * 50)
    print("Заливка начальных данных в БД")
    print("=" * 50)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        for data in SEED_DATA:
            scores = data.pop("scores")

            uni = db.query(University).filter(University.name == data["name"]).first()
            if not uni:
                uni = University(**data)
                db.add(uni)
                db.flush()
                print(f"  [+] {uni.name}")
            else:
                for k, v in data.items():
                    setattr(uni, k, v)
                print(f"  [~] {uni.name}")

            for s in scores:
                existing = db.query(Score).filter(
                    Score.university_id == uni.id,
                    Score.year == s["year"]
                ).first()
                if not existing:
                    db.add(Score(university_id=uni.id, **s))

            db.commit()

    except Exception as e:
        db.rollback()
        print(f"[ОШИБКА] {e}")
        raise
    finally:
        db.close()

    print(f"\nГотово! Залито {len(SEED_DATA)} вузов с историей баллов за 6 лет.")


if __name__ == "__main__":
    run_seed()