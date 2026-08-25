FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_mysql zip mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY . .

RUN cp .env.example .env

RUN rm -rf vendor \
    && composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction

RUN mkdir -p config/jwt var/cache var/log \
    && chmod -R 777 config/jwt var

EXPOSE 8080

CMD ["sh", "-c", "php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction && php bin/console doctrine:migrations:migrate --no-interaction && php -S 0.0.0.0:${PORT:-8080} -t public"]