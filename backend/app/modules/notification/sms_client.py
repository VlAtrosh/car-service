from .service import NotificationService


class SmsClient:
    @staticmethod
    def send(phone: str, text: str) -> bool:
        return NotificationService.send_sms(phone, text)
