# Migrazione a File .env Centralizzato

## Panoramica

Il progetto ora utilizza un **unico file `.env` centralizzato** nella root del progetto invece di file .env separati per ogni servizio.

## Struttura Precedente (DEPRECATA) ❌

```
evm-ipfs-upload/
├── .env.docker           # Docker environment
├── app/
│   └── .env              # Frontend environment
└── server/
    └── .env              # Backend environment
```

## Nuova Struttura (RACCOMANDATA) ✅

```
evm-ipfs-upload/
└── .env                  # Centralized environment for ALL services
```

## Vantaggi della Centralizzazione

1. **🎯 Single Source of Truth**: Un unico file da configurare e mantenere
2. **🔄 Consistency**: Stessi valori garantiti per tutti i servizi
3. **📝 Easier Maintenance**: Modifiche in un solo posto
4. **🐳 Docker Friendly**: Docker Compose carica automaticamente `.env` dalla root
5. **🔒 Better Security**: Più facile gestire i segreti in un unico posto

## Migrazione

### Passo 1: Crea il nuovo .env

```bash
# Dalla root del progetto
cp .env.example .env
```

### Passo 2: Configura le variabili

Apri `.env` e configura almeno:

```bash
# REQUIRED - Ottieni da https://pinata.cloud
PINATA_API_KEY=your_actual_api_key
PINATA_SECRET_KEY=your_actual_secret_key

# REQUIRED - Cambia con password sicura
MONGO_INITDB_ROOT_PASSWORD=your_secure_password
```

### Passo 3: Elimina i file vecchi (OPZIONALE)

```bash
# Backup dei file vecchi (opzionale)
mv .env.docker .env.docker.backup
mv app/.env app/.env.backup
mv server/.env server/.env.backup

# Oppure eliminarli direttamente
rm .env.docker
rm app/.env
rm server/.env
```

### Passo 4: Verifica la configurazione

```bash
# Test backend
cd server
npm start

# In un altro terminale, test frontend
cd app
npm start
```

## Configurazione per Ambiente

### Development (Locale)

Il file `.env` di default è configurato per development locale:

```bash
NODE_ENV=development
MONGO_URI=mongodb://admin:password@localhost:27017/ipfs-upload?authSource=admin
REACT_APP_SERVER_URL=http://localhost:5001
```

### Docker

Per Docker, decommentare le variabili Docker-specific:

```bash
# Uncomment for Docker:
MONGO_URI=mongodb://admin:password@mongodb:27017/ipfs-upload?authSource=admin
# REACT_APP_SERVER_URL=http://backend:5001  # Se necessario
```

### Production

Per production:

```bash
NODE_ENV=production
# Usare un URI MongoDB sicuro con credenziali forti
MONGO_URI=mongodb://user:password@mongo-host:27017/db?authSource=admin
# Configurare CORS con domini specifici
ALLOWED_ORIGINS=https://yourdomain.com
```

## Caricamento del .env

### Backend (Server)

Il server è configurato per caricare `.env` dalla root:

```javascript
// server/server.js
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
```

### Frontend (React)

React carica automaticamente `.env` dalla root del progetto se eseguito con `npm start` dalla directory `app/`.

Per variabili React, usare sempre il prefisso `REACT_APP_`:

```bash
REACT_APP_SERVER_URL=http://localhost:5001
REACT_APP_PINATA_GATEWAY_URL=https://gateway.pinata.cloud
```

### Docker Compose

Docker Compose carica automaticamente `.env` dalla stessa directory del `docker-compose.yml`:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      PORT: ${PORT}
      MONGO_URI: ${MONGO_URI}
      # ...
```

## Variabili Disponibili

### Sezioni

1. **MongoDB Configuration** - Database setup
2. **Backend Server Configuration** - Server settings
3. **Pinata IPFS Configuration** - IPFS upload settings
4. **Backend Security Configuration** - CORS, rate limiting
5. **Ethereum Network Configuration** - Blockchain network
6. **Frontend Configuration** - React app settings
7. **Docker-Specific Overrides** - Docker environment

Vedi [`.env.example`](../.env.example) per la lista completa con descrizioni.

## Troubleshooting

### Variabili non caricate

**Problema**: Le variabili d'ambiente non vengono caricate

**Soluzione**:
1. Verifica che il file `.env` sia nella root del progetto
2. Controlla che il nome file sia esattamente `.env` (nessuna estensione)
3. Riavvia il server dopo modifiche al `.env`

### Docker non legge le variabili

**Problema**: Docker Compose non carica le variabili

**Soluzione**:
1. Assicurati che `.env` sia nella stessa directory di `docker-compose.yml`
2. Riavvia i container: `docker-compose down && docker-compose up`
3. Verifica la sintassi: nessuno spazio prima/dopo `=`

### React non vede le variabili

**Problema**: `process.env.REACT_APP_*` è undefined

**Soluzione**:
1. Le variabili React devono iniziare con `REACT_APP_`
2. Riavvia il server React dopo modifiche al `.env`
3. Verifica che il `.env` sia nella root, non in `app/`

## Best Practices

1. **Mai commitare `.env`**: È già in `.gitignore`
2. **Usare `.env.example`**: Template per nuovi sviluppatori
3. **Documentare nuove variabili**: Aggiungerle a `.env.example`
4. **Password forti**: Usare password complesse per production
5. **Separare segreti**: Considerare AWS Secrets Manager per production

## Link Utili

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Docker Compose - Environment Variables](https://docs.docker.com/compose/environment-variables/)

---

**Ultimo aggiornamento**: Gennaio 2026
