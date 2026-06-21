# Деплой: домашний сервер (Docker) + VPS (nginx) через SSH reverse-туннель

Схема:
```
Браузер → https://your-domain.ru (VPS:443, nginx + TLS)
        → proxy_pass 127.0.0.1:8001 (VPS)
        → SSH reverse tunnel
        → 127.0.0.1:8000 (домашний сервер)
        → Docker: backend (FastAPI) + PostgreSQL
```
Публичный трафик принимает VPS, приложение работает дома. БД наружу не торчит.

---

## Предусловия
- VPS с публичным IP, домен `your-domain.ru`, A-запись домена указывает на IP VPS.
- На VPS и дома — Ubuntu/Debian, root/sudo доступ.
- На домашнем сервере установлен Docker.

---

## Часть A. Домашний сервер — запустить приложение

```bash
# 1. Скопировать проект на домашний сервер (git clone или scp).
cd china-reviews

# 2. Создать .env из примера и заполнить секреты.
cp .env.prod.example .env
nano .env            # задать пароль БД и SECRET_KEY (openssl rand -hex 32)

# 3. Запустить в фоне.
docker compose -f docker-compose.prod.yml up -d --build

# 4. Проверить локально на домашнем сервере.
curl -s http://127.0.0.1:8000/health      # -> {"status":"ok"}
```
Приложение слушает только 127.0.0.1:8000 — наружу его выставит туннель.

---

## Часть B. Ключ SSH дом → VPS (без пароля)

На ДОМАШНЕМ сервере:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/vps_tunnel -N ""
ssh-copy-id -i ~/.ssh/vps_tunnel.pub VPS_USER@VPS_IP
# проверить вход без пароля:
ssh -i ~/.ssh/vps_tunnel VPS_USER@VPS_IP "echo ok"
```
> Если используете отдельный ключ, добавьте в ExecStart сервиса флаг `-i /home/USER/.ssh/vps_tunnel`.

---

## Часть C. Постоянный туннель (autossh + systemd)

На ДОМАШНЕМ сервере:
```bash
sudo apt update && sudo apt install -y autossh
sudo cp deploy/autossh-tunnel.service /etc/systemd/system/
sudo nano /etc/systemd/system/autossh-tunnel.service   # вписать User, VPS_USER, VPS_IP
sudo systemctl daemon-reload
sudo systemctl enable --now autossh-tunnel
systemctl status autossh-tunnel
```

На VPS убедиться, что туннель пришёл:
```bash
curl -s http://127.0.0.1:8001/health      # -> {"status":"ok"}
```

> Важно: чтобы reverse-проброс работал на адрес 127.0.0.1 VPS, в `/etc/ssh/sshd_config`
> на VPS обычно достаточно стандартных настроек. Если порт не поднимается —
> добавьте `GatewayPorts clientspecified` и `systemctl restart ssh`.

---

## Часть D. VPS — nginx как входная точка

```bash
sudo apt install -y nginx
sudo cp deploy/nginx-vps.conf /etc/nginx/sites-available/china-reviews
sudo nano /etc/nginx/sites-available/china-reviews   # заменить your-domain.ru
sudo ln -s /etc/nginx/sites-available/china-reviews /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```
Проверка по HTTP: открыть `http://your-domain.ru` — должен открыться сайт.

---

## Часть E. HTTPS (Let's Encrypt)

На VPS:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ru -d www.your-domain.ru
# выбрать redirect (перенаправлять http -> https)
```
Certbot сам допишет в nginx-конфиг блок `listen 443 ssl` и настроит автопродление.
Проверить: открыть `https://your-domain.ru`.

---

## Часть F. Firewall на VPS (рекомендуется)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'      # 80 + 443
sudo ufw enable
```
Порт 8001 наружу НЕ открываем — он слушается только на 127.0.0.1 VPS и доступен
лишь nginx и SSH-туннелю.

---

## Проверка всей цепочки

| Где | Команда | Ожидаем |
|---|---|---|
| Дом | `curl 127.0.0.1:8000/health` | `{"status":"ok"}` |
| VPS | `curl 127.0.0.1:8001/health` | `{"status":"ok"}` |
| Любой браузер | `https://your-domain.ru` | сайт + рабочий поиск |

---

## Обслуживание

```bash
# Обновить приложение (на домашнем сервере):
cd china-reviews
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Логи backend:
docker compose -f docker-compose.prod.yml logs -f backend

# Перезапустить туннель (дома):
sudo systemctl restart autossh-tunnel

# Полностью сбросить БД (удалит данные!):
docker compose -f docker-compose.prod.yml down -v
```

---

## Типичные проблемы

| Симптом | Причина / решение |
|---|---|
| `502 Bad Gateway` на VPS | туннель не работает: проверь `systemctl status autossh-tunnel` дома и `curl 127.0.0.1:8001/health` на VPS |
| Туннель рвётся ночью | это и решает autossh + ServerAlive*; проверь, что сервис `enabled` |
| `certbot` не выдаёт сертификат | домен ещё не указывает на IP VPS (проверь `dig your-domain.ru`), или порт 80 закрыт firewall |
| Сайт открылся, но без стилей | очисти кэш браузера; стили отдаёт сам backend из /static |
| reverse-порт 8001 не слушается на VPS | добавь `GatewayPorts clientspecified` в sshd_config на VPS |
