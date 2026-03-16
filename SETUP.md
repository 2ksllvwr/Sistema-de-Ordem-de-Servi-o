# Setup do Projeto

## O que ja ficou pronto

- Frontend React preparado para usar API por `VITE_API_URL`
- Backend Express pronto para MongoDB em `server/`
- Fallback para `localStorage` enquanto o Mongo nao estiver configurado
- `.gitignore` criado
- Git inicializado nesta pasta

## Como ligar o MongoDB

1. Copie [`.env.example`](/x:/sistema%20de%20ordem%20de%20serviço/.env.example) para `.env`
2. Copie [`server/.env.example`](/x:/sistema%20de%20ordem%20de%20serviço/server/.env.example) para `server/.env`
3. No `server/.env`, troque `MONGODB_URI` pela sua string do MongoDB Atlas
4. Rode:

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path
npm run dev:full
```

## Como saber se conectou

Abra:

`http://localhost:4000/api/health`

Se estiver certo, o retorno muda para:

```json
{"ok":true,"databaseReady":true,"mongoConfigured":true}
```

## Como migrar os dados locais para o Mongo

Com o backend ligado e o Mongo configurado, abra o sistema no navegador. O app passa a usar a API.

Se voce quiser importar os dados que ja estavam no navegador, me chama que eu adiciono um botao de migracao tambem. A estrutura da API ja esta pronta para isso.

## Como conectar Git ao GitHub

### 1. Defina seu nome e email

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
```

### 2. Crie o primeiro commit

```powershell
git add .
git commit -m "Base pronta para API e MongoDB"
```

### 3. Crie um repositorio no GitHub

Crie vazio, sem README, sem `.gitignore`, sem license.

### 4. Conecte o remoto

```powershell
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

## Como contar seus commits

### Total local neste repositorio

```powershell
git rev-list --count HEAD
```

### Seus commits por autor

```powershell
git shortlog -s -n --all --author="Seu Nome"
```

### Ver historico resumido

```powershell
git log --oneline --decorate --graph --all
```
