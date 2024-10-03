# Use the official PHP image as a base
FROM php:8.0-cli

# Install required PHP extensions and other dependencies
RUN apt-get update && \
    apt-get install -y \
    libzip-dev \
    unzip \
    && docker-php-ext-install zip

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install

# Expose the port for the WebSocket server
EXPOSE 8080

# Command to run the WebSocket server
CMD ["php", "websocket-server.php"]
