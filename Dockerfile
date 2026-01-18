FROM python:3.12-slim

WORKDIR /app

# Copy requirements.txt first to leverage Docker cache
COPY CHATBOT/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY CHATBOT /app

EXPOSE 5002

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5002", "app:app"]