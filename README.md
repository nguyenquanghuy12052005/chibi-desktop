# 🐱 Chibi Assistant

> **Trợ lý ảo thông minh ngay trên màn hình desktop của bạn** — hiển thị dưới dạng nhân vật Chibi trong suốt, luôn sẵn sàng giúp bạn học tiếng Anh, trả lời câu hỏi và truy xuất tài liệu cá nhân mà không làm gián đoạn workflow.

![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

![Demo](./docs/demo.gif)

---

## ✨ Tính năng cốt lõi

- 🪟 **Cửa sổ trong suốt, always-on-top** — Chibi nằm trên màn hình, không che workflow, chỉ click được vào nhân vật
- 🎭 **State Machine hoạt ảnh** — Chibi phản ứng theo cảm xúc: `IDLE` / `ALERT` / `THINKING` / `SUCCESS` / `FAILED`
- 📚 **Quiz từ vựng tiếng Anh** — Tự động hỏi mỗi 15 phút với bộ dữ liệu tĩnh, lưu lịch sử đúng/sai local
- 🤖 **Chatbot Gemini AI** — Trò chuyện tự do với streaming response (chữ hiện dần như ChatGPT)
- 🧠 **Bộ nhớ ngữ cảnh** — Nhớ lịch sử hội thoại theo session, không hỏi lại những gì đã nói
- 🔍 **RAG Knowledge Base** — Truy xuất tài liệu cá nhân (PDF, note) qua PostgreSQL + pgvector
- 🔕 **Chế độ Do Not Disturb** — Tắt thông báo khi cần tập trung, điều khiển qua System Tray

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                   ELECTRON APP                       │
│                                                      │
│  ┌─────────────────┐        ┌────────────────────┐  │
│  │  Main Process   │  IPC   │ Renderer Process   │  │
│  │   (Node.js)     │◄──────►│    (React + Vite)  │  │
│  │                 │        │                    │  │
│  │ • node-cron     │        │ • State Machine    │  │
│  │ • Click-through │        │ • Chibi Animation  │  │
│  │ • System Tray   │        │ • Speech Bubble    │  │
│  │ • Window mgmt   │        │ • Chat Input UI    │  │
│  └────────┬────────┘        └────────────────────┘  │
│           │                                          │
│           ▼ HTTP (localhost:3001)                    │
│  ┌─────────────────┐                                 │
│  │  Local Backend  │                                 │
│  │  (Express)      │                                 │
│  │                 │                                 │
│  │ • mock.provider │──► Gemini API (Phase 3+)        │
│  │ • gemini.provider                                 │
│  │ • RAG service   │──► pgvector similarity search   │
│  └────────┬────────┘                                 │
│           │                                          │
│           ▼                                          │
│  ┌─────────────────┐                                 │
│  │   PostgreSQL    │                                 │
│  │   (Docker)      │                                 │
│  │                 │                                 │
│  │ • chibi_memories│                                 │
│  │ • vocabulary    │                                 │
│  │ • knowledge_    │                                 │
│  │   chunks        │                                 │
│  └─────────────────┘                                 │
└─────────────────────────────────────────────────────┘
```

> **Lưu ý:** Streaming Gemini response được xử lý qua Express local server thay vì IPC trực tiếp để tránh nghẽn event loop của Electron.

---

## 🗺️ Lộ trình phát triển

- [x] **Phase 0 — Nền tảng Electron**
  - Cửa sổ transparent, always-on-top, frame-less
  - Click-through background, kéo thả nhân vật
  - System Tray icon

- [x] **Phase 1 — State Machine & Animation**
  - Tích hợp `xstate` quản lý trạng thái Chibi
  - Speech bubble component
  - Nút Do Not Disturb

- [ ] **Phase 2 — Quiz từ vựng (Mock Data)**
  - Cronjob 15 phút tự động hỏi từ vựng
  - IPC flow: Main ↔ Renderer hoàn chỉnh
  - Lưu lịch sử đúng/sai vào file local

- [ ] **Phase 3 — Gemini API & Streaming Chat**
  - Provider pattern: `mock.provider` → `gemini.provider`
  - Express local server xử lý streaming
  - Trạng thái `THINKING` khi chờ API

- [ ] **Phase 4 — Bộ nhớ PostgreSQL**
  - Docker + PostgreSQL setup
  - Lưu lịch sử hội thoại theo session
  - Inject context vào Gemini prompt

- [ ] **Phase 5 — RAG Knowledge Base**
  - Ollama local cho vector embedding
  - pgvector tìm kiếm tài liệu theo độ tương đồng
  - Chibi trả lời dựa trên tài liệu cá nhân

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 18.x
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.ai/) *(chỉ cần ở Phase 5)*

### Các bước cài đặt

**1. Clone repository**

```bash
git clone https://github.com/your-username/chibi-assistant.git
cd chibi-assistant
```

**2. Cài dependencies**

```bash
npm install
cd apps/electron && npm install
cd ../backend && npm install
```

**3. Cấu hình biến môi trường**

```bash
cp .env.example .env
# Mở .env và điền các giá trị cần thiết
```

**4. Khởi động PostgreSQL bằng Docker** *(Phase 4+)*

```bash
docker-compose up -d
```

**5. Chạy ứng dụng**

```bash
npm run dev
```

> **Ghi chú:** Ở Phase 0–2 (Mock Data), bạn **không cần** `GEMINI_API_KEY` hay Docker. Chỉ cần `npm install` và `npm run dev` là đủ để chạy toàn bộ tính năng học từ vựng.

---

## ⚙️ Biến môi trường

Tạo file `.env` ở thư mục gốc dựa trên `.env.example`:

| Biến | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|
| `GEMINI_API_KEY` | Phase 3+ | API key từ [Google AI Studio](https://aistudio.google.com/) | `AIza...` |
| `DATABASE_URL` | Phase 4+ | Connection string PostgreSQL | `postgresql://user:pass@localhost:5432/chibi` |
| `POSTGRES_USER` | Phase 4+ | Username PostgreSQL (Docker) | `chibi_user` |
| `POSTGRES_PASSWORD` | Phase 4+ | Password PostgreSQL (Docker) | `chibi_pass` |
| `POSTGRES_DB` | Phase 4+ | Tên database | `chibi_db` |
| `BACKEND_PORT` | Tùy chọn | Port Express local server | `3001` |
| `OLLAMA_BASE_URL` | Phase 5+ | URL Ollama local server | `http://localhost:11434` |

---

## 📁 Cấu trúc thư mục

```
chibi-assistant/
├── apps/
│   ├── electron/               # Electron main process
│   │   ├── main.js             # Entry point, window config
│   │   ├── tray.js             # System tray
│   │   └── ipc/                # IPC handlers
│   └── renderer/               # React (Vite)
│       ├── components/
│       │   ├── Chibi/          # Nhân vật + animation
│       │   └── SpeechBubble/   # Bong bóng thoại
│       └── machines/
│           └── chibi.machine.js # XState State Machine
├── backend/                    # Express local server
│   └── services/
│       └── providers/
│           ├── mock.provider.js
│           └── gemini.provider.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚠️ Hạn chế đã biết

| Hạn chế | Nguyên nhân | Hướng giải quyết |
|---|---|---|
| RAM cao (~150MB baseline) | Electron bundle Chromium engine | Migrate sang **Tauri** (Rust) |
| Tốn tiền API | Gemini tính phí theo token | Dùng **Ollama** chạy model local |
| Phụ thuộc internet | Gemini API cần kết nối mạng | Ollama + Llama 3 / Gemma 3 offline |
| Single-user, không có auth | Thiết kế cho cá nhân | Nằm ngoài scope dự án |
| Build riêng cho từng OS | Đặc thù Electron | `electron-builder` hỗ trợ cross-platform |

---

## 📄 License

MIT © 2025 — Made with ❤️ and too much coffee.