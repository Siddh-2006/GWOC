def build_response(response_data):
    """
    Formats the internal response data into the final API JSON format.
    """
    base_response = {
        "text": response_data.get("content", ""),
        "type": response_data.get("type", "text")  # text, data, etc.
    }
    
    if "data" in response_data:
        base_response["data"] = response_data["data"]
        base_response["dataType"] = response_data.get("data_type")

    return base_response
