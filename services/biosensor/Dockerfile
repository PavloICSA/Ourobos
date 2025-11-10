# OuroborOS-Chimera Bio Sensor API
# Docker container for development/testing (not for Raspberry Pi deployment)

FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY bio_sensor_node.py .
COPY app.py .

# Expose API port
EXPOSE 5001

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Note: Hardware sensors won't work in Docker
# The app will run in mock mode automatically
CMD ["python", "app.py"]
