# TypeScript 日志库

一个现代化的纯 TypeScript 日志库，适用于 Node.js v18+，灵感来自 log4js-node 架构。

## 特性

- ✨ 纯 TypeScript，完整的类型安全
- 📦 ESM 模块 (ES2022)
- 🚀 支持现代 Node.js v18+
- 🎨 可配置的布局和输出器
- 📝 多个日志级别 (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
- 🎯 基于分类的日志记录
- 🔧 灵活的配置
- 💾 控制台和文件输出器
- 🎨 彩色控制台输出
- 🔄 支持 PM2 集群环境

## 安装

```bash
pnpm install
pnpm build
```

## 快速开始

```typescript
import { getLogger } from './index.js';

// 使用默认配置获取日志器
const logger = getLogger('app');

logger.trace('追踪消息');
logger.debug('调试消息');
logger.info('信息消息');
logger.warn('警告消息');
logger.error('错误消息');
logger.fatal('致命错误消息');
```

## 配置

使用自定义输出器和分类配置日志系统：

```typescript
import { configure, getLogger } from './index.js';

configure({
  appenders: {
    console: { 
      type: 'console',
      layout: { type: 'colored' }
    },
    file: {
      type: 'file',
      filename: './logs/app.log',
      layout: { 
        type: 'pattern', 
        pattern: '%d{ISO8601} [%p] %c - %m' 
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' },
    app: { appenders: ['console', 'file'], level: 'DEBUG' }
  }
});

const logger = getLogger('app');
logger.info('配置完成的日志器');
```

## 日志级别

日志库支持以下级别（按严重程度升序排列）：

- `ALL` - 所有日志消息
- `TRACE` - 最详细的信息事件
- `DEBUG` - 用于调试的细粒度信息事件
- `INFO` - 突出应用程序进度的信息消息
- `WARN` - 潜在有害的情况
- `ERROR` - 可能仍允许应用程序继续运行的错误事件
- `FATAL` - 可能导致应用程序中止的非常严重的错误事件
- `MARK` - 重要事件的标记
- `OFF` - 不记录日志

## 输出器 (Appenders)

### 控制台输出器

将日志事件写入标准输出：

```typescript
{
  type: 'console',
  layout: { type: 'colored' }
}
```

### 文件输出器

将日志事件写入文件：

```typescript
{
  type: 'file',
  filename: './logs/app.log',
  layout: { type: 'pattern', pattern: '%d %p %c - %m' }
}
```

## 布局 (Layouts)

### 模式布局 (Pattern Layout)

使用标记的可自定义格式：

- `%d{DATE}` - 日期/时间
- `%p` - 日志级别
- `%c` - 分类名称
- `%m` - 日志消息

```typescript
{ 
  type: 'pattern', 
  pattern: '%d{ISO8601} [%p] %c - %m' 
}
```

### 彩色布局 (Colored Layout)

为日志级别添加颜色：

```typescript
{ type: 'colored' }
```

### 基础布局 (Basic Layout)

简单的消息输出：

```typescript
{ type: 'basic' }
```

## 上下文 (Context)

向日志事件添加上下文信息：

```typescript
const logger = getLogger('user-service');
logger.addContext('userId', '12345');
logger.addContext('sessionId', 'abc-def');
logger.info('用户操作'); // 上下文包含在日志事件中

logger.removeContext('sessionId');
logger.clearContext();
```

## 级别检查

在执行昂贵操作之前检查是否启用日志级别：

```typescript
if (logger.isDebugEnabled()) {
  const expensiveData = computeExpensiveData();
  logger.debug('数据:', expensiveData);
}
```

## PM2 支持

本日志库完全支持 PM2 集群环境。在 PM2 集群模式下：

### 基本使用

```typescript
import { configure, getLogger } from './index.js';

// 配置日志系统
configure({
  appenders: {
    console: { type: 'console' },
    file: { 
      type: 'file', 
      filename: './logs/app.log',
      // PM2 环境下，每个进程会自动添加进程 ID
    }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'INFO' }
  }
});

const logger = getLogger('app');
logger.info('应用启动'); // 日志会包含进程 ID
```

### PM2 配置示例

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/index.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    }
  }]
};
```

### 进程识别

每个日志事件自动包含进程 ID (`pid`)，可以在日志中轻松识别来自不同进程的消息：

```typescript
// 日志输出示例
// [INFO] app - 应用启动 (pid: 12345)
// [INFO] app - 应用启动 (pid: 12346)
```

### 多进程文件日志

当使用文件输出器时，建议为每个进程使用不同的日志文件，或使用支持并发写入的文件系统：

```typescript
import { configure, getLogger } from './index.js';

const processId = process.env.pm_id || process.pid;

configure({
  appenders: {
    file: {
      type: 'file',
      filename: `./logs/app-${processId}.log`
    }
  },
  categories: {
    default: { appenders: ['file'], level: 'INFO' }
  }
});
```

## 架构

本库遵循 log4js-node 架构，包含以下主要组件：

1. **Level** - 表示日志严重程度级别
2. **Logger** - 主要日志接口
3. **LoggingEvent** - 表示单个日志事件
4. **Appender** - 将日志事件输出到目标位置
5. **Layout** - 为输出格式化日志事件
6. **Configuration** - 管理日志器设置和分类

## 开发

### 构建

```bash
pnpm build
```

### 监听模式

```bash
pnpm dev
```

### 运行示例

```bash
pnpm build
node dist/example.js
```

### 格式化代码

```bash
pnpm format
```

## 与 log4js-node 的区别

这是一个参考 log4js-node 架构的纯 TypeScript 重写，而不是移植：

- 使用现代 ES2022 语法和 ESM 模块
- 完全用 TypeScript 编写，具有完整的类型安全
- 简化的 API，专注于常见用例
- 异步文件操作
- 现代 Node.js v18+ 特性
- 支持 PM2 集群环境

## 许可证

Apache-2.0
