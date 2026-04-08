## docker管理命令合集

### 🐳 Docker 信息查看

| 命令 | 说明 |
| :--- | :--- |
| `docker version` | 查看 Docker 客户端和服务端版本信息 |
| `docker info` | 查看 Docker 系统级信息（镜像数、容器数、存储驱动等） |
| `docker system df` | 查看 Docker 磁盘占用情况（镜像、容器、卷） |

---

### 📦 镜像管理 (Images)

| 命令 | 说明 |
| :--- | :--- |
| `docker images` 或 `docker image ls` | 列出本地所有镜像 |
| `docker pull <镜像名:标签>` | 从仓库拉取镜像，例如 `docker pull nginx:alpine` |
| `docker build -t <镜像名:标签> .` | 使用当前目录的 Dockerfile 构建镜像 |
| `docker tag <原镜像> <新标签>` | 给镜像打标签 |
| `docker rmi <镜像ID/名称>` | 删除镜像（`-f` 强制删除） |
| `docker image prune` | 删除无用的悬空镜像（`<none>:<none>`） |
| `docker save -o <文件名.tar> <镜像名>` | 将镜像导出为 tar 文件 |
| `docker load -i <文件名.tar>` | 从 tar 文件导入镜像 |
| `docker history <镜像名>` | 查看镜像的构建历史层 |

---

### 📦 容器管理 (Containers)

| 命令 | 说明 |
| :--- | :--- |
| `docker ps` | 列出正在运行的容器 |
| `docker ps -a` | 列出所有容器（包括已停止的） |
| `docker run <选项> <镜像名>` | 创建并启动一个新容器 |
| `docker start <容器ID/名称>` | 启动一个已存在的停止容器 |
| `docker stop <容器ID/名称>` | 停止一个运行中的容器 |
| `docker restart <容器ID/名称>` | 重启容器 |
| `docker rm <容器ID/名称>` | 删除已停止的容器（`-f` 强制删除运行中容器） |
| `docker rename <旧名称> <新名称>` | 重命名容器 |
| `docker exec -it <容器ID/名称> /bin/bash` | 进入运行中的容器并打开 bash 终端 |
| `docker logs <容器ID/名称>` | 查看容器日志（`-f` 实时跟踪） |
| `docker cp <本地文件> <容器:路径>` | 将文件复制到容器中 |
| `docker cp <容器:路径> <本地路径>` | 将容器内文件复制到本地 |
| `docker inspect <容器ID/名称>` | 查看容器详细配置信息（JSON 格式） |
| `docker stats` | 实时查看容器资源占用（CPU、内存等） |
| `docker top <容器ID/名称>` | 查看容器内运行的进程 |
| `docker port <容器ID/名称>` | 查看容器的端口映射情况 |
| `docker commit <容器ID> <新镜像名>` | 将容器当前状态保存为新镜像 |

---

### 🧹 系统清理

| 命令 | 说明 |
| :--- | :--- |
| `docker system prune` | 清理所有未使用的资源（镜像、容器、网络、缓存） |
| `docker system prune -a` | 清理所有未使用的资源（包括未被任何容器引用的镜像） |
| `docker container prune` | 清理所有停止的容器 |
| `docker image prune -a` | 清理所有未被使用的镜像 |
| `docker volume prune` | 清理所有未被使用的数据卷 |

---

### 🌐 网络管理 (Networks)

| 命令 | 说明 |
| :--- | :--- |
| `docker network ls` | 列出所有网络 |
| `docker network inspect <网络名>` | 查看网络详细信息 |
| `docker network create <网络名>` | 创建自定义网络 |
| `docker network connect <网络名> <容器名>` | 将运行中的容器连接到网络 |
| `docker network disconnect <网络名> <容器名>` | 断开容器与网络的连接 |
| `docker network rm <网络名>` | 删除网络 |

---

### 💾 数据卷管理 (Volumes)

| 命令 | 说明 |
| :--- | :--- |
| `docker volume ls` | 列出所有数据卷 |
| `docker volume create <卷名>` | 创建数据卷 |
| `docker volume inspect <卷名>` | 查看数据卷详细信息 |
| `docker volume rm <卷名>` | 删除数据卷 |
| `docker volume prune` | 清理所有未被使用的数据卷 |

---

### 🔧 Docker Compose 常用命令（新版 `docker compose` 插件）

| 命令 | 说明 |
| :--- | :--- |
| `docker compose up -d` | 后台启动 `docker-compose.yml` 中定义的服务 |
| `docker compose down` | 停止并删除服务、网络（卷默认保留） |
| `docker compose down -v` | 停止并删除服务、网络和**数据卷**（慎用） |
| `docker compose ps` | 查看 Compose 管理的容器状态 |
| `docker compose logs -f` | 查看所有服务的日志并实时跟踪 |
| `docker compose exec <服务名> /bin/bash` | 进入指定服务的容器 |
| `docker compose build` | 重新构建服务镜像 |
| `docker compose pull` | 拉取服务依赖的最新镜像 |
| `docker compose restart` | 重启所有服务 |
