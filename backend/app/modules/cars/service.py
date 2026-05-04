from typing import List, Dict, Optional
from ...core.file_storage import (
    get_all_cars, get_car_by_id, get_cars_by_client,
    add_car, update_car, delete_car
)


class CarService:
    
    @staticmethod
    def get_all() -> List[Dict]:
        return get_all_cars()
    
    @staticmethod
    def get_by_id(car_id: str) -> Optional[Dict]:
        return get_car_by_id(car_id)
    
    @staticmethod
    def get_by_client(client_id: str) -> List[Dict]:
        return get_cars_by_client(client_id)
    
    @staticmethod
    def create(car_data: Dict) -> Dict:
        return add_car(car_data)
    
    @staticmethod
    def update(car_id: str, car_data: Dict) -> Optional[Dict]:
        return update_car(car_id, car_data)
    
    @staticmethod
    def delete(car_id: str) -> bool:
        return delete_car(car_id)