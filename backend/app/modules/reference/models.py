class Work:
    def __init__(self, id: str, name: str, price_per_hour: float):
        self.id = id
        self.name = name
        self.price_per_hour = price_per_hour


class Part:
    def __init__(self, id: str, name: str, article: str, price: float):
        self.id = id
        self.name = name
        self.article = article
        self.price = price
