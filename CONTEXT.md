# CHIBI ASSISTANT — PROJECT CONTEXT

> File này dùng để cung cấp ngữ cảnh dự án cho AI assistant.
> Khi bắt đầu hội thoại mới, paste file này vào và nói đang ở Phase nào.

---

## 1. THÔNG TIN DỰ ÁN

- **Tên:** Chibi Assistant — Desktop Mascot Chatbot
- **Dev:** Sinh viên CNPM năm 3, VKU Đà Nẵng, vừa học vừa làm
- **Mục tiêu:** Trợ lý ảo nhân vật chibi trong suốt trên desktop, học từ vựng → chatbot AI → RAG tài liệu cá nhân
- **Timeline:** ~12–15 tuần

---

## 2. TECH STACK

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| Desktop shell | Electron | main process = Node.js, renderer = React |
| UI | React + Vite | component-based, không dùng Next.js |
| State Machine | xstate | quản lý cảm xúc chibi |
| Giao tiếp nội bộ | Electron IPC | main ↔ renderer |
| Backend local | Express.js | port 3001, xử lý streaming |
| Scheduler | node-cron | chạy trong main process |
| AI | Gemini API | provider pattern, swap được |
| ORM | Prisma | query PostgreSQL bằng JS |
| Database | PostgreSQL (Docker) | lưu memory + vocabulary |
| Embedding | Ollama + nomic-embed-text | local, không tốn tiền |
| Vector search | pgvector | extension của PostgreSQL |
| ID | uuid (uuidv4) | toàn bộ dự án, không dùng auto-increment |

---

## 3. KIẾN TRÚC

```
Electron Main Process (Node.js)
  ├── node-cron          → trigger quiz mỗi 15 phút
  ├── ipcMain            → nhận/gửi event với Renderer
  ├── setIgnoreMouseEvents → click-through logic
  └── System Tray

      ↕ IPC

Renderer Process (React + Vite)
  ├── xstate machine     → IDLE/ALERT/THINKING/SUCCESS/FAILED
  ├── Chibi component    → hiển thị GIF theo state
  └── SpeechBubble       → hiển thị message

      ↕ HTTP fetch (localhost:3001)

Express Local Backend
  └── services/providers/
      ├── mock.provider.js    → Phase 0–2
      └── gemini.provider.js  → Phase 3+

      ↕ SQL (Prisma)

PostgreSQL (Docker)
  ├── vocabulary         → từ vựng tiếng Anh
  ├── chibi_memories     → lịch sử chat theo session
  └── knowledge_chunks   → RAG document chunks + vector
```

**Lưu ý kiến trúc quan trọng:**
- Streaming KHÔNG qua IPC → qua Express HTTP để tránh nghẽn event loop
- Provider pattern: chỉ đổi 1 dòng `require()` để swap mock → Gemini

---

## 4. CẤU TRÚC THƯ MỤC

```
chibi-assistant/
├── apps/
│   ├── electron/
│   │   ├── main.js             # entry point, BrowserWindow config
│   │   ├── tray.js             # system tray
│   │   └── ipc/                # ipcMain handlers
│   └── renderer/               # React (Vite)
│       ├── components/
│       │   ├── Chibi/
│       │   └── SpeechBubble/
│       └── machines/
│           └── chibi.machine.js
├── backend/
│   └── services/
│       └── providers/
│           ├── mock.provider.js
│           └── gemini.provider.js
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── .env
└── .env.example
```

---

## 5. DATABASE SCHEMA

```sql
-- Từ vựng
vocabulary (
  id           UUID PRIMARY KEY,
  word         VARCHAR,
  definition_vi TEXT,
  example      TEXT
)

-- Lịch sử chat
chibi_memories (
  id         UUID PRIMARY KEY,
  session_id UUID,
  role       VARCHAR,   -- 'user' | 'model'
  message    TEXT,
  created_at TIMESTAMP
)

-- RAG document chunks
knowledge_chunks (
  id          UUID PRIMARY KEY,
  content     TEXT,
  embedding   VECTOR(768),   -- Ollama nomic-embed-text
  source_url  VARCHAR,
  chunk_index INTEGER,
  metadata    JSONB,
  created_at  TIMESTAMP
)
```

---

## 6. WEBSOCKET/IPC PAYLOAD CHUẨN

```json
{
  "event": "MASCOT_COMMAND",
  "payload": {
    "interaction_id": "<uuid>",
    "ui_state": "ALERT",
    "display_type": "QUIZ",
    "speaker": "CHIBI",
    "message": "Từ này có nghĩa là: Dư thừa, không cần thiết",
    "metadata": {
      "quiz_id": "<uuid>"
    }
  }
}
```

**ui_state hợp lệ:** `IDLE` | `ALERT` | `THINKING` | `SUCCESS` | `FAILED`
**display_type hợp lệ:** `QUIZ` | `CHAT` | `NOTIFY`

---

## 7. BIẾN MÔI TRƯỜNG

```env
GEMINI_API_KEY=        # Phase 3+, từ Google AI Studio
DATABASE_URL=          # Phase 4+, postgresql://user:pass@localhost:5432/chibi
POSTGRES_USER=         # Phase 4+
POSTGRES_PASSWORD=     # Phase 4+
POSTGRES_DB=           # Phase 4+
BACKEND_PORT=3001      # Port Express local
OLLAMA_BASE_URL=http://localhost:11434  # Phase 5+
```

---

## 8. ROADMAP & TRẠNG THÁI

### Phase 0 — Electron Window (1 tuần)
**Mục tiêu:** Cửa sổ transparent, chibi hiện trên desktop
- [ ] Electron + React (Vite) boilerplate
- [ ] `transparent: true`, `frame: false`, `alwaysOnTop: true`
- [ ] Click-through background (`setIgnoreMouseEvents`)
- [ ] Hiển thị GIF chibi cơ bản
- [ ] Kéo thả nhân vật
- [ ] System Tray icon

**Gotcha:**
```js
// Toggle click-through theo vị trí chuột — xử lý trong main.js
win.webContents.on('cursor-changed', (_, type) => {
  win.setIgnoreMouseEvents(type === 'default', { forward: true })
})
```

---

### Phase 1 — State Machine + Animation (1 tuần)
**Mục tiêu:** Chibi có cảm xúc, bong bóng thoại
- [ ] Cài xstate, định nghĩa machine
- [ ] Map state → GIF tương ứng
- [ ] Speech bubble component
- [ ] Tray menu: Show / Hide / Do Not Disturb
- [ ] Auto transition: SUCCESS/FAILED → IDLE sau 3 giây

**State transitions:**
```
IDLE → ALERT → THINKING → SUCCESS → IDLE
                        → FAILED  → IDLE
```

---

### Phase 2 — Quiz Mock Data (2 tuần)
**Mục tiêu:** Flow học từ vựng hoàn chỉnh, không cần internet
- [ ] File `vocabulary.json` (20–30 từ mẫu)
- [ ] node-cron trigger mỗi 15 phút trong main.js
- [ ] IPC flow: cron → ipcMain → ipcRenderer → UI → answer → check
- [ ] Lưu lịch sử đúng/sai vào `history.json` local
- [ ] Hiển thị streak / tỉ lệ đúng

**IPC events:**
```
main → renderer : QUIZ_START   { word_id, definition_vi }
renderer → main : QUIZ_ANSWER  { word_id, answer }
main → renderer : QUIZ_RESULT  { correct: bool, word, example }
```

---

### Phase 3 — Gemini API + Streaming (2 tuần)
**Mục tiêu:** Chatbot hỏi đáp tự do, stream chữ
- [ ] Express server (backend/server.js, port 3001)
- [ ] `gemini.provider.js` dùng `@google/generative-ai`
- [ ] Streaming endpoint `POST /chat`
- [ ] React fetch stream, update bubble từng chunk
- [ ] Thêm state THINKING + animation chờ
- [ ] Thêm input box chat thường trực

**Swap provider:**
```js
// interaction.service.js — chỉ đổi 1 dòng
const provider = require('./providers/gemini.provider') // đổi từ mock
```

---

### Phase 4 — Memory + PostgreSQL (2 tuần)
**Mục tiêu:** Chibi nhớ ngữ cảnh hội thoại
- [ ] Docker Compose setup PostgreSQL
- [ ] Prisma schema + migrate
- [ ] Lưu mỗi turn chat vào `chibi_memories`
- [ ] Inject 10 message gần nhất vào Gemini prompt
- [ ] Migrate vocabulary từ JSON → PostgreSQL
- [ ] Session management (mỗi lần mở app = session mới)

---

### Phase 5 — RAG Knowledge Base (3 tuần)
**Mục tiêu:** Chibi hiểu tài liệu cá nhân
- [ ] Cài Ollama, pull `nomic-embed-text`
- [ ] Enable pgvector extension
- [ ] Script đọc file (PDF/TXT) → chunk → embed → lưu DB
- [ ] Similarity search: embed câu hỏi → tìm TOP 3 chunks
- [ ] Inject chunks vào Gemini prompt trước khi gửi
- [ ] UI upload tài liệu

**RAG flow:**
```
user hỏi
  → embed câu hỏi (Ollama)
  → SELECT chunks ORDER BY embedding <-> query_vec LIMIT 3
  → inject vào prompt
  → Gemini trả lời dựa trên context
```

---

## 9. GOTCHA TỔNG HỢP

| Phase | Vấn đề | Giải pháp |
|---|---|---|
| 0 | Click-through không stable | Dùng `cursor-changed` event thay mousemove |
| 2 | Cron fire lúc đang fullscreen game | Kiểm tra `win.isFocused()` hoặc DND mode |
| 3 | IPC lag khi stream chunk | Dùng HTTP fetch stream, không qua IPC |
| 3 | Token limit Gemini | Giới hạn history inject tối đa 10 messages |
| 4 | Mất data khi restart | Đảm bảo Prisma migrate chạy khi app start |
| 5 | Embed chậm với document lớn | Chunk size 500 tokens, xử lý background |

---

## 10. HẠN CHẾ DỰ ÁN

| Hạn chế | Nguyên nhân | Giải pháp tương lai |
|---|---|---|
| RAM ~150MB baseline | Electron bundle Chromium | Migrate sang Tauri (Rust) |
| Tốn tiền Gemini API | Tính phí theo token | Ollama + Llama 3 / Gemma 3 local |
| Cần internet | Gemini API | Chạy hoàn toàn offline với Ollama |
| Single-user | Thiết kế cá nhân | Ngoài scope |
| Build riêng từng OS | Đặc thù Electron | electron-builder cross-platform |

---

## 11. CÁCH DÙNG FILE NÀY

Khi bắt đầu hội thoại mới với AI, paste nội dung file này và thêm:

```
Tôi đang ở [Phase X], cụ thể đang làm task: [tên task]
Vấn đề hiện tại: [mô tả vấn đề]
```

Ví dụ:
```
Tôi đang ở Phase 0, cụ thể đang làm: click-through background
Vấn đề: setIgnoreMouseEvents không hoạt động đúng khi chuột ở viền chibi
```