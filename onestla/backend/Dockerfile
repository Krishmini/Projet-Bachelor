FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql zip mbstring

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN rm -rf vendor/ && composer install --no-dev --optimize-autoloader --no-scripts

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public/"]