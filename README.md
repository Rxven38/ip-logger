# Konkurs IP Logger

Prosta strona z logowaniem, która po zalogowaniu pobiera IP użytkownika i wysyła je na wybrany kanał Discord.

## Jak to działa

1. Użytkownik wchodzi na stronę i się loguje (test / haslo123)
2. Serwer pobiera jego publiczne IP
3. Bot Discord wysyła wiadomość na ustawiony kanał w stylu:  
   `test: 192.168.1.1` (albo dokładniej IPv6)

## Wymagania

- Node.js 18+ (lub nowszy)
- Konto Discord Developer i bot z uprawnieniami

## Konfiguracja

1. Utwórz plik `.env` w głównym folderze i wpisz:
