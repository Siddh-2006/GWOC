def validate_email(email):
    return "@" in email # Simple check

def validate_booking_request(data):
    required = ["date", "time"]
    for field in required:
        if field not in data:
            return False
    return True
