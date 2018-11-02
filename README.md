# Как начать новый проект.

1. Клонировать репозиторий **git clone**.
2. Удалить папку **git**, иницировать новую **git init**, создать удаленный репозиторий и привезать его **git remote add origin адрес**.
3. Отредактровать **package.json** удалив ненужные пакеты с помощью команд npm и изменить пути в **paths.json**.
4. Установить зависимости **npm i**.
5. Запускаем сборку **npm run start**.

## Разметка.

Файлы для сборки pug находяться в (**assets/pug/**). В папке (**assets/pug/helpers/**) находятся миксины (**assets/pug/helpers/mixin/**)
и перменные (**assets/pug/helpers/variables/**). Папка (assets/pug/modules/) содержит файлы (**_header.pug,_nav.pug,_footer.pug**)
содержащие одноименные блоки кода. Папка (assets/pug/templates/) содержит по умолчанию один шаблон.

## Стили.

В папке (**assets/static/scss/**) содержать файлы для сборки **scss** файлы. Папка (**assets/static/scss/base/**) 
содержит файлы со шрифтами и сброса стилей. Папка (**assets/static/scss/helpers/**) содержит переменные и миксины.
Папка (**assets/static/scss/modules/**) содержит стили для модулей (**assets/pug/modules/**). 
Файл (**assets/static/scss/custom.scss**) для пользовательских стилей.
    
 