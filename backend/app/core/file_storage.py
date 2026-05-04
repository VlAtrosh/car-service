import json
import uuid
from pathlib import Path
from typing import Dict, List, Any, Optional

# Путь к папке с данными (относительно core)
DATA_DIR = Path(__file__).parent.parent.parent / "data"
CARS_FILE = DATA_DIR / "cars.json"


def _read_json(file_path: Path) -> Dict:
    """Читает JSON файл"""
    if not file_path.exists():
        return {}
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def _write_json(file_path: Path, data: Dict) -> None:
    """Записывает данные в JSON файл"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ========== РАБОТА С АВТОМОБИЛЯМИ ==========
def get_all_cars() -> List[Dict]:
    """Получить все автомобили"""
    data = _read_json(CARS_FILE)
    return data.get("cars", [])


def get_car_by_id(car_id: str) -> Optional[Dict]:
    """Получить автомобиль по ID"""
    cars = get_all_cars()
    for car in cars:
        if car.get("id") == car_id:
            return car
    return None


def get_cars_by_client(client_id: str) -> List[Dict]:
    """Получить автомобили клиента"""
    cars = get_all_cars()
    return [car for car in cars if car.get("client_id") == client_id]


def add_car(car_data: Dict) -> Dict:
    """Добавить новый автомобиль"""
    cars = get_all_cars()
    car_data["id"] = f"car_{uuid.uuid4().hex[:8]}"
    cars.append(car_data)
    _write_json(CARS_FILE, {"cars": cars})
    return car_data


def update_car(car_id: str, car_data: Dict) -> Optional[Dict]:
    """Обновить автомобиль"""
    cars = get_all_cars()
    for i, car in enumerate(cars):
        if car.get("id") == car_id:
            car_data["id"] = car_id
            cars[i] = car_data
            _write_json(CARS_FILE, {"cars": cars})
            return car_data
    return None


def delete_car(car_id: str) -> bool:
    """Удалить автомобиль"""
    cars = get_all_cars()
    new_cars = [car for car in cars if car.get("id") != car_id]
    if len(new_cars) != len(cars):
        _write_json(CARS_FILE, {"cars": new_cars})
        return True
    return False