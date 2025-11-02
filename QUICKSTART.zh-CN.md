# 快速入门指南 - TypeScript 日志库

## 安装和设置

1. 安装依赖：
```bash
pnpm install
```

2. 构建项目：
```bash
pnpm build
```

3. 运行测试：
```bash
pnpm test
```

4. 运行示例：
```bash
pnpm example
```

## 基本使用

### 简单日志记录

```typescript
import { getLogger } from './index.js';

const logger = getLogger('app');

logger.trace('追踪消息');
logger.debug('调试消息');
logger.info('信息消息');
logger.warn('警告消息');
logger.error('错误消息');
logger.fatal('致命错误消息');
```

### 带配置使用

```typescript
import { configure, getLogger } from './index.js';

// 配置日志系统
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
logger.info('应用启动');
```

## 核心特性

### 1. 日志级别

日志库支持 9 个日志级别：
- `ALL` - 记录所有内容
- `TRACE` - 最细粒度的调试信息
- `DEBUG` - 调试信息
- `INFO` - 一般信息
- `WARN` - 警告消息
- `ERROR` - 错误消息
- `FATAL` - 严重错误
- `MARK` - 重要标记
- `OFF` - 不记录日志

### 2. 多个输出器

将日志发送到不同的目标位置：
- **控制台输出器**: 输出到标准输出
- **文件输出器**: 写入文件

### 3. 灵活的布局

以不同方式格式化日志：
- **基础布局**: 简单的消息输出
- **彩色布局**: 带颜色的级别编码
- **模式布局**: 带标记的可自定义格式

### 4. 上下文

向所有日志添加上下文信息：

```typescript
const logger = getLogger('user-service');
logger.addContext('userId', '12345');
logger.addContext('sessionId', 'abc-xyz');
logger.info('用户操作'); // 包含上下文
```

### 5. 级别检查

在日志被禁用时避免昂贵的操作：

```typescript
if (logger.isDebugEnabled()) {
  const expensiveData = computeExpensiveData();
  logger.debug('数据:', expensiveData);
}
```

## 项目结构

```
src/
├── Level.ts              # 日志级别定义
├── Logger.ts             # 主日志器类
├── LoggingEvent.ts       # 日志事件表示
├── Configuration.ts      # 配置管理
├── index.ts             # 主导出
├── appenders/           # 输出目标
│   ├── console.ts       # 控制台输出器
│   ├── file.ts          # 文件输出器
│   └── index.ts         # 导出
├── layouts/             # 格式化函数
│   └── index.ts         # 所有布局
├── types/               # TypeScript 类型
│   └── Appender.ts      # 输出器接口
├── example.ts           # 使用示例
└── test.ts              # 测试套件
```

## 开发命令

```bash
# 构建项目
pnpm build

# 监听模式（更改时自动重新构建）
pnpm dev

# 运行测试
pnpm test

# 运行示例
pnpm example

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 清理构建产物
pnpm clean
```

## 配置选项

### 输出器类型

**控制台输出器：**
```typescript
{
  type: 'console',
  layout: { type: 'colored' }
}
```

**文件输出器：**
```typescript
{
  type: 'file',
  filename: './logs/app.log',
  layout: { type: 'pattern', pattern: '%d [%p] %c - %m' }
}
```

### 布局类型

**模式布局：**
```typescript
{
  type: 'pattern',
  pattern: '%d{ISO8601} [%p] %c - %m'
}
```
标记：
- `%d{DATE}` - 日期/时间 (ISO8601)
- `%p` - 日志级别
- `%c` - 分类名称
- `%m` - 日志消息

**彩色布局：**
```typescript
{ type: 'colored' }
```

**基础布局：**
```typescript
{ type: 'basic' }
```

## PM2 集群支持

### 基本 PM2 配置

```typescript
import { configure, getLogger } from './index.js';

// 自动检测 PM2 环境
configure({
  appenders: {
    console: { type: 'console' },
    file: { 
      type: 'file', 
      filename: './logs/app.log'
    }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'INFO' }
  }
});

const logger = getLogger('app');
logger.info('应用在 PM2 集群中启动');
```

### PM2 Ecosystem 配置

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'my-typescript-app',
    script: './dist/index.js',
    instances: 'max',  // 或指定数字，如 4
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    env_production: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    env_development: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug'
    }
  }]
};
```

### 每个进程独立的日志文件

```typescript
import { configure, getLogger } from './index.js';

// 使用 PM2 进程 ID 或 Node.js 进程 ID
const processId = process.env.pm_id || process.pid;

configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: `./logs/app-${processId}.log`,
      layout: { 
        type: 'pattern', 
        pattern: '%d{ISO8601} [%p] [PID:%pid] %c - %m' 
      }
    }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'INFO' }
  }
});

const logger = getLogger('app');
logger.info('进程启动', { processId });
```

### PM2 日志管理

使用 PM2 命令管理日志：

```bash
# 查看实时日志
pm2 logs my-typescript-app

# 查看特定进程的日志
pm2 logs my-typescript-app --lines 100

# 清空日志
pm2 flush

# 重新加载应用（零停机）
pm2 reload my-typescript-app
```

## 扩展库

### 自定义输出器

```typescript
import { Appender } from './types/Appender.js';
import { LoggingEvent } from './LoggingEvent.js';
import { Layout } from './layouts/index.js';

export function myCustomAppender(config: { layout?: Layout }): Appender {
  return (event: LoggingEvent) => {
    const output = config.layout ? config.layout(event) : String(event.data);
    // 将输出发送到您的目标位置
    console.log(output);
  };
}
```

### 自定义布局

```typescript
import { Layout } from './layouts/index.js';

export function myCustomLayout(): Layout {
  return (event) => {
    return `${event.categoryName}: ${event.data.join(' ')}`;
  };
}
```

## 最佳实践

1. **使用适当的日志级别**: 不要将所有内容都记录为 INFO
2. **使用分类**: 按组件/模块组织日志器
3. **检查级别**: 在昂贵操作之前使用 `isDebugEnabled()`
4. **添加上下文**: 包含相关的上下文信息
5. **按环境配置**: 为开发/生产环境使用不同的配置
6. **关注点分离**: 为不同目的使用不同的输出器
7. **PM2 环境**: 为每个进程使用独立的日志文件或支持并发写入的系统

## 与 log4js-node 的区别

这是一个参考 log4js-node 架构的纯 TypeScript 重写，而不是移植：

- 使用现代 ES2022 语法和 ESM 模块
- 完全用 TypeScript 编写，具有完整的类型安全
- 简化的 API，专注于常见用例
- 异步文件操作
- 现代 Node.js v18+ 特性
- 原生支持 PM2 集群环境

## 示例

查看 `src/example.ts` 获取全面的使用示例。

运行方式：
```bash
pnpm example
```

## 测试

该库包含 33 个测试，涵盖：
- 级别系统
- 日志器创建和方法
- LoggingEvent 序列化
- 输出器集成
- 配置
- 上下文管理

运行测试：
```bash
pnpm test
```

## 文档

- `README.zh-CN.md` - 主要文档（中文）
- `ARCHITECTURE.zh-CN.md` - 架构和设计模式（中文）
- `QUICKSTART.zh-CN.md` - 本快速入门指南（中文）
- `README-TS.md` - 主要文档（英文）
- `ARCHITECTURE.md` - 架构文档（英文）
- `QUICKSTART.md` - 快速入门指南（英文）

## 许可证

Apache-2.0

## 要求

- Node.js 18+
- pnpm 9+
- TypeScript 5+
