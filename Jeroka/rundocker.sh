# Build the Docker image
docker build -t jeroka .

# Run the container
docker run -p 8090:8090 jeroka