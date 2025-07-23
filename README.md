# GameCom - Gaming Community Platform 🎮

Een moderne full-stack gaming community platform gebouwd met React, Node.js, en PostgreSQL. GameCom biedt gamers een plek om hun gamebibliotheek te beheren, andere spelers te ontmoeten, achievements te verdienen, en real-time te chatten.

## 🌟 Features

### 👥 User Management
- Registratie en login (inclusief Steam OAuth)
- Uitgebreid gebruikersprofiel met avatar en bio
- Vriendensysteem met vriendschapsverzoeken
- XP systeem en gebruikersniveaus
- Blocklist management

### 🎮 Game Library
- Steam API integratie voor automatische game import
- Game reviews en ratings
- Wishlist functionaliteit
- Playtime tracking
- Game aanbevelingen

### 🏆 Achievements & Gamification
- Badge en achievement systeem
- Custom achievements (admin definieert)
- Progress tracking per game
- Leaderboards
- XP systeem met levels

### 💬 Social Features
- Real-time chat (individueel & groepen)
- Forums/discussies per game
- Gaming groepen & communities
- "Meet Gamers" functie
- Notificatiesysteem

### 🛠️ Admin Dashboard
- User management
- Game database beheer
- Achievement & challenge beheer
- Statistieken en analytics
- API settings

### 📱 UI/UX
- Responsive design (mobile-first)
- Dark/Light mode support
- Moderne animaties en transities
- Consistent styling met Radix UI + Tailwind

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** als build tool
- **Tailwind CSS** voor styling
- **Radix UI** component library
- **React Hook Form** voor formulieren
- **Socket.io** voor real-time communicatie
- **Zustand** voor state management
- **React Query** voor data fetching

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **PostgreSQL** database
- **Drizzle ORM** voor database interactie
- **Redis** voor sessies & caching
- **Passport.js** voor authenticatie
- **Socket.io server** voor chats

### Infra & Tools
- **Docker** & **Docker Compose**
- **Steam API** integratie
- **WebSocket** integratie

## 🚀 Quick Start

### Prerequisites
- Docker en Docker Compose
- Node.js 18+ (voor development)
- PostgreSQL database (of gebruik Docker)

### 1. Clone Repository
```bash
git clone <repository-url>
cd gamecom
```

### 2. Environment Setup
```bash
# Kopieer environment file
cp env.example .env

# Vul de database credentials in
# Database URL: postgresql://danny:Jjustmee12773@45.154.238.111:5432/gamecom
```

### 3. Start met Docker
```bash
# Start alle services
docker-compose up -d

# Of start alleen de database en Redis
docker-compose up -d postgres redis
```

### 4. Database Setup
```bash
# Ga naar backend directory
cd backend

# Installeer dependencies
npm install

# Genereer database schema
npm run db:generate

# Push schema naar database
npm run db:push
```

### 5. Start Development Servers

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📁 Project Structure

```
gamecom/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── database/       # Database schema en connection
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── socket/         # Socket.IO handlers
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker services
├── env.example            # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://danny:Jjustmee12773@45.154.238.111:5432/gamecom
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Steam API
STEAM_API_KEY=your-steam-api-key-here

# Server
PORT=3001
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Steam API Setup
1. Ga naar [Steam Developer](https://steamcommunity.com/dev/apikey)
2. Genereer een API key
3. Voeg de key toe aan je `.env` file
4. Configureer de return URL in je Steam app settings

## 🗄️ Database Schema

Het platform gebruikt PostgreSQL met de volgende hoofdtabellen:

- **users** - Gebruikersprofielen en authenticatie
- **games** - Game informatie en metadata
- **user_games** - Gebruikers game bibliotheek
- **achievements** - Achievement definities
- **user_achievements** - Gebruiker achievements
- **friendships** - Vriendschapsrelaties
- **chat_rooms** - Chat rooms en groepen
- **messages** - Chat berichten
- **forums** - Forum categorieën
- **forum_topics** - Forum topics
- **forum_posts** - Forum posts
- **notifications** - Gebruiker notificaties

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

### Docker Production
```bash
# Build en start alle services
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build voor production
npm run db:generate  # Genereer database schema
npm run db:push      # Push schema naar database
npm run db:studio    # Open Drizzle Studio
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build voor production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registratie
- `POST /api/auth/login` - User login
- `GET /api/auth/steam` - Steam OAuth
- `GET /api/auth/verify` - Token verificatie

### User Endpoints
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/friends` - Get friends list
- `POST /api/users/friends/request` - Send friend request

### Game Endpoints
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get game details
- `POST /api/games/:id/library` - Add to library
- `GET /api/games/library/user` - Get user library

### Chat Endpoints
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:id/messages` - Get room messages

### Forum Endpoints
- `GET /api/forums` - Get all forums
- `GET /api/forums/:id` - Get forum with topics
- `POST /api/forums/:id/topics` - Create topic

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

#### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

#### Frontend Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie de [LICENSE](LICENSE) file voor details.

## 🙏 Acknowledgments

- [Steam API](https://developer.valvesoftware.com/wiki/Steam_Web_API) voor game data
- [Radix UI](https://www.radix-ui.com/) voor UI componenten
- [Tailwind CSS](https://tailwindcss.com/) voor styling
- [Drizzle ORM](https://orm.drizzle.team/) voor database management

## 📞 Support

Voor vragen of support:
- Open een issue op GitHub
- Email: support@gamecom.com
- Discord: [GameCom Community](https://discord.gg/gamecom)

---

**GameCom** - Verbind gamers, deel ervaringen, verdien achievements! 🎮✨ 