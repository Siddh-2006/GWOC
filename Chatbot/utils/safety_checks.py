import re

def validate_input(text):
    if not text or len(text) > 1000:
        return False
    return True

def contains_pii(text):
    # Simple regex for email or phone
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'\b\d{10}\b'
    if re.search(email_pattern, text) or re.search(phone_pattern, text):
        return True
    return False
