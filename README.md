# Nyaomaru Portfolio

<p align="center">
    <img src="https://raw.githubusercontent.com/nyaomaru/nyaomaru-portfolio/main/public/assets/nyaomaru_game_thumbnail.png" width="600px" align="center" alt="nyaomaru run game thumbnail" />
</p>

"Run Away From Work"

You can play here: https://nyaomaru-portfolio.vercel.app/game

A `Remix` + `React` + `TypeScript` portfolio built with Feature-Sliced Design.

[![shields-fsd-domain](https://img.shields.io/badge/Feature--Sliced-Design?style=for-the-badge&color=F2F2F2&labelColor=262224&logoWidth=10&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAaCAYAAAC3g3x9AAAACXBIWXMAAALFAAACxQGJ1n/vAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABISURBVHgB7dKxCQAgDETR0w2cws0cys2cwhEUBbsggikCuVekDHwSQFlYo7Q+8KnmtHdFWMdk2cl5wSsbxGSZw8dm8pX9ZHUTMBUgGU2F718AAAAASUVORK5CYII=)](https://feature-sliced.github.io/documentation/)

## 🚀 Highlights

- **Jump Game (Main Feature)**: Side-scrolling jump game with obstacles, boss phases, clear sequences, and restart flow.
- **Interactive Terminal**: Ask profile-related questions in a terminal-style UI backed by the `/api/ask` endpoint.
- **Responsive UI**: Works across desktop and mobile layouts.
- **FSD Architecture**: Organized by features/widgets/pages/shared layers.

## 🎮 Main Feature: Game

<p align="center">
    <img src="https://raw.githubusercontent.com/nyaomaru/nyaomaru-portfolio/main/public/assets/gif/run_away_from_work.gif" width="600px" align="center" alt="nyaomaru run game gif" />
</p>

The game is available at `/game`.

Can you watch true ending? 🚀

### 🕹️ Controls

| Action        | Description                 |
| ------------- | --------------------------- |
| Space / Click | Jump                        |
| Tap           | Jump                        |
| Double Jump   | Jump again while in the air |

## 💻 Terminal

The terminal is available on the top page and is designed for profile Q&A.

### ✨ What It Does

- Sends user input to `/api/ask`.
- Returns an AI-generated answer based on profile context.
- Shows typing/waiting states in terminal history.

### ⚠️ Important

`/api/ask` requires `OPENAI_API_KEY`. Without it, the API returns an error response.

## 🛠️ Tech Stack

- **Framework**: [Remix](https://remix.run/) - Full-stack React framework
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **AI Integration**: [LangChain](https://langchain.com/) + OpenAI API (`/api/ask`)
- **Architecture**: [Feature-Sliced Design (FSD)](https://feature-sliced.design/) - Scalable code organization
- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- **Language**: TypeScript - Full type safety throughout the application

## 🚀 Getting Started

You can also use `mise`. Please check `mise.toml`.

### 1. Install

```bash
pnpm install
```

### 2. Configure Environment

Create `.env` and set your key:

```bash
cp .env.example .env
```

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Dev Server

```bash
pnpm dev
```

Default local URL: `http://localhost:5173`

## 📜 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm typecheck` - TypeScript type check
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm lint` - Run ESLint

## 🏗️ Project Structure

```text
app/                Remix app entry/routes
features/           Domain features (including jump-game)
pages/              Route-level page modules
widgets/            Composite UI blocks (header, terminal)
shared/             Shared UI/libs/constants/api
public/             Static assets
```

## 🤝 Contributing

Contributions are welcome.

- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Developer guide: [DEVELOPER.md](DEVELOPER.md)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Remix](https://remix.run/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Feature-Sliced Design](https://feature-sliced.design/) for architecture guidance

Enjoy!! 🐱
