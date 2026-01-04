# LLM多模态Playground

一个功能完整的LLM多模态实验平台，支持模型切换、多类型输入输出、提示词编辑和超参数调整。

## 功能特性

- ✅ **多模型支持**: 通过OpenRouter API支持多种LLM模型
- ✅ **多模态输入**: 支持文本、图片、视频和音频输入
- ✅ **多模态输出**: 支持文本、图片、视频和音频输出渲染
- ✅ **流式输出**: 实时显示模型生成的内容
- ✅ **超参数调整**: 可调整temperature、max_tokens、top_p等参数
- ✅ **提示词编辑**: 支持系统提示词和用户提示词编辑
- ✅ **历史记录**: 保存对话历史，方便回顾
- ✅ **文件管理**: 文件大小限制和格式验证
- ✅ **媒体预览**: 图片、视频、音频上传前预览
- ✅ **响应式设计**: 适配桌面和移动设备

## 技术栈

### 后端
- **FastAPI**: 现代Python Web框架
- **httpx**: 异步HTTP客户端
- **Pydantic**: 数据验证和序列化

### 前端
- **React 18**: UI框架
- **TypeScript**: 类型安全
- **Vite**: 快速构建工具
- **Tailwind CSS**: 样式框架
- **React Markdown**: Markdown渲染

## 项目结构

```
llm_playground/
├── llm_playground_service/  # Python FastAPI后端服务
│   ├── app/
│   │   ├── main.py      # FastAPI应用入口
│   │   ├── routers/     # API路由
│   │   ├── services/    # 业务逻辑
│   │   ├── schemas/     # Pydantic模型
│   │   └── config.py    # 配置管理
│   ├── requirements.txt
│   └── .env             # 环境变量（需要创建）
├── llm_playground_ui/   # React + Vite前端服务
│   ├── src/
│   │   ├── components/  # UI组件
│   │   ├── services/    # API调用
│   │   ├── types/       # TypeScript类型
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 快速开始

### 1. 环境准备

确保已安装：
- Python 3.8+
- Node.js 18+
- npm 或 yarn

### 2. 后端设置

```bash
# 进入后端目录
cd llm_playground_service

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 创建.env文件
# 复制以下内容到 llm_playground_service/.env:
# OPENROUTER_API_KEY=your_api_key_here
# HTTP_REFERER=http://localhost:5173
# X_TITLE=LLM Playground
```

### 3. 前端设置

```bash
# 进入前端目录
cd llm_playground_ui

# 安装依赖
npm install
```

### 4. 启动服务

#### 启动后端（终端1）

```bash
cd llm_playground_service
uvicorn app.main:app --reload --port 8000
```

后端将在 `http://localhost:8000` 运行

#### 启动前端（终端2）

```bash
cd llm_playground_ui
npm run dev
```

前端将在 `http://localhost:5173` 运行

### 5. 访问应用

打开浏览器访问 `http://localhost:5173`

## API文档

后端启动后，可以访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 环境变量

### 后端 (.env)

```env
OPENROUTER_API_KEY=sk-or-v1-...  # OpenRouter API密钥
HTTP_REFERER=http://localhost:5173
X_TITLE=LLM Playground
```

## 使用说明

1. **选择模型**: 在左侧面板选择要使用的LLM模型
2. **设置系统提示词**: 定义AI助手的角色和行为
3. **输入内容**: 
   - 在文本框中输入文本
   - 点击"上传图片/视频/音频"或拖拽文件
   - 支持同时输入文本和多种媒体文件
   - 文件大小限制：图片≤10MB, 视频≤50MB, 音频≤20MB
4. **调整超参数**: 根据需要调整temperature、max_tokens等参数
5. **发送请求**: 点击"发送"按钮或使用 Ctrl/Cmd + Enter
6. **查看输出**: 右侧面板实时显示模型生成的内容
   - 文本输出：支持Markdown渲染
   - 媒体输出：自动检测并渲染图片、视频、音频
   - 支持下载生成的媒体文件

## 开发

### 后端开发

```bash
cd llm_playground_service
uvicorn app.main:app --reload
```

### 前端开发

```bash
cd llm_playground_ui
npm run dev
```

### 构建生产版本

```bash
# 前端
cd llm_playground_ui
npm run build

# 后端
# 使用生产级ASGI服务器，如：
cd llm_playground_service
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Docker 部署

两个服务可以独立部署，适合生产环境。

### 后端服务部署 (llm_playground_service)

#### 1. 构建镜像

```bash
cd llm_playground_service
docker build -t llm-playground-service .
```

#### 2. 运行容器

```bash
# 使用环境变量文件
docker run -d \
  --name llm-playground-service \
  -p 8000:8000 \
  --env-file .env \
  llm-playground-service

# 或直接传递环境变量
docker run -d \
  --name llm-playground-service \
  -p 8000:8000 \
  -e OPENROUTER_API_KEY=your_api_key_here \
  llm-playground-service
```

### 前端服务部署 (llm_playground_ui)

#### 1. 构建镜像

**重要**: 构建时需要传入后端 API 地址作为构建参数：

```bash
cd llm_playground_ui
docker build \
  --build-arg VITE_API_BASE_URL=http://your-backend-url:8000/api \
  -t llm-playground-ui .
```

如果后端和前端部署在同一域名下（通过反向代理），可以使用相对路径：

```bash
docker build \
  --build-arg VITE_API_BASE_URL=/api \
  -t llm-playground-ui .
```

#### 2. 运行容器

```bash
docker run -d \
  --name llm-playground-ui \
  -p 5173:80 \
  llm-playground-ui
```

### 部署注意事项

1. **CORS 配置**: 部署时需要在 `llm_playground_service/app/config.py` 中更新 `CORS_ORIGINS` 为实际的前端域名，例如：
   ```python
   CORS_ORIGINS: list = [
       "https://your-frontend-domain.com",
       "http://your-frontend-domain.com",
   ]
   ```

2. **API 地址配置**: 
   - 前端构建时通过 `--build-arg VITE_API_BASE_URL` 传入后端 API 地址
   - 如果使用反向代理（如 Nginx），可以配置为相对路径 `/api`

3. **环境变量**: 后端服务需要 `OPENROUTER_API_KEY` 环境变量，确保在 `.env` 文件中配置或通过 `-e` 参数传递

4. **网络配置**: 如果两个服务部署在不同服务器，确保网络连通性和防火墙配置正确

### 使用 Docker Compose 部署（可选）

项目根目录提供了 `docker-compose.yml` 文件，可以一键启动两个服务：

```bash
# 在项目根目录
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

**注意**: 使用 docker-compose 时，需要确保 `llm_playground_service/.env` 文件存在并包含 `OPENROUTER_API_KEY`。

如果需要修改前端 API 地址，编辑 `docker-compose.yml` 中的 `VITE_API_BASE_URL` 参数。

## 注意事项

1. **API密钥安全**: 不要将`.env`文件提交到版本控制系统
2. **CORS配置**: 如需部署，请在后端`config.py`中更新CORS_ORIGINS
3. **图片大小**: 大图片会转换为base64，可能影响性能，建议压缩图片
4. **API限流**: OpenRouter可能有请求频率限制，请注意控制请求频率

## 许可证

MIT License
