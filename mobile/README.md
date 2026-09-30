# Kaos em Nova Patos — Mobile

App React Native (Expo) para fichas do RPG Kaos em Nova Patos.

## Desenvolvimento

```sh
cd mobile
npm install
npm run start
```

Escaneie o QR code com o **Expo Go** (Android/iOS).

## Scripts

- `npm run start` — Metro + Expo
- `npm run android` / `npm run ios` — abrir no emulador
- `npm test` — testes de regras (Vitest)

## Dados

Usa as mesmas chaves de `localStorage` do app web (`kaos-characters`, etc.), via AsyncStorage no dispositivo.
