# TypeScript 日志库架构

本文档描述了 TypeScript 日志库的架构，灵感来自 log4js-node。

## 概述

该日志库采用模块化架构构建，由几个关键组件组成，这些组件协同工作以提供灵活而强大的日志记录功能。

## 核心组件

### 1. Level (`src/Level.ts`)

`Level` 类表示日志严重程度级别。每个级别都有：
- 一个数值（用于比较）
- 一个字符串表示（例如，"INFO"、"WARN"）
- 一个颜色（用于终端输出）

**标准级别**（从最低到最高严重程度）：
- `ALL` (Number.MIN_VALUE)
- `TRACE` (5000)
- `DEBUG` (10000)
- `INFO` (20000)
- `WARN` (30000)
- `ERROR` (40000)
- `FATAL` (50000)
- `MARK` (Number.MAX_SAFE_INTEGER)
- `OFF` (Number.MAX_VALUE)

**关键方法**：
- `isLessThanOrEqualTo()` - 比较级别
- `isGreaterThanOrEqualTo()` - 比较级别
- `isEqualTo()` - 检查相等性
- `getLevel()` - 按名称检索级别的静态方法

### 2. LoggingEvent (`src/LoggingEvent.ts`)

表示单个日志事件及其所有元数据：
- `startTime` - 创建日志时的时间戳
- `categoryName` - 日志器分类
- `data` - 记录的项目数组
- `level` - 日志级别
- `context` - 键值上下文数据
- `pid` - 进程 ID
- `error` - 可选的 Error 对象
- `location` - 可选的调用堆栈信息

**关键方法**：
- `serialise()` - 转换为 JSON 字符串
- `deserialise()` - 从 JSON 恢复的静态方法

### 3. Logger (`src/Logger.ts`)

应用程序使用的主要日志接口。每个日志器都有：
- 分类名称
- 日志级别阈值
- 输出器列表
- 上下文对象

**关键方法**：
- 级别特定方法：`trace()`、`debug()`、`info()`、`warn()`、`error()`、`fatal()`
- 级别检查：`isTraceEnabled()`、`isDebugEnabled()` 等
- 通用日志记录：`log(level, ...args)`
- 上下文管理：`addContext()`、`removeContext()`、`clearContext()`

**日志记录流程**：
1. 用户调用日志器方法（例如，`logger.info('message')`）
2. 日志器检查是否启用该级别
3. 如果启用，创建 LoggingEvent
4. 将事件传递给所有配置的输出器

### 4. Appenders (`src/appenders/`)

输出器是将日志事件输出到特定目标位置的函数。

**接口**：
```typescript
interface Appender {
  (event: LoggingEvent): void;
  shutdown?: (callback: (error?: Error) => void) => void;
}
```

**内置输出器**：

#### 控制台输出器 (`console.ts`)
- 使用 `console.log()` 输出到标准输出
- 接受用于格式化的布局函数

#### 文件输出器 (`file.ts`)
- 将日志写入文件
- 根据需要创建目录
- 支持自定义布局
- 使用异步文件操作

**创建自定义输出器**：
```typescript
function myAppender(layout: Layout): Appender {
  return (event: LoggingEvent) => {
    const output = layout(event);
    // 将输出发送到某处
  };
}
```

### 5. Layouts (`src/layouts/index.ts`)

布局将 LoggingEvent 对象格式化为字符串以供输出。

**接口**：
```typescript
type Layout = (event: LoggingEvent) => string;
```

**内置布局**：

#### 基础布局
- 简单的消息输出
- 只是用空格连接的记录数据

#### 彩色布局
- 根据日志级别添加 ANSI 颜色代码
- 格式：`[LEVEL] message`

#### 模式布局
- 带有标记的可自定义格式：
  - `%d{DATE}` - 日期/时间 (ISO8601)
  - `%p` - 日志级别
  - `%c` - 分类名称
  - `%m` - 日志消息
- 默认模式：`%d{ISO8601} [%p] %c - %m`

**创建自定义布局**：
```typescript
function myLayout(): Layout {
  return (event: LoggingEvent) => {
    return `[${event.level}] ${event.data.join(' ')}`;
  };
}
```

### 6. Configuration (`src/Configuration.ts`)

管理整个日志系统配置。

**配置结构**：
```typescript
interface LoggerConfig {
  appenders: Record<string, {
    type: string;
    [key: string]: unknown;
  }>;
  categories: Record<string, {
    appenders: string[];
    level: string;
    enableCallStack?: boolean;
  }>;
}
```

**注册表模式**：
- 单例 `LoggerRegistry` 管理所有日志器
- 使用默认配置进行延迟初始化
- 日志器实例被缓存和重用

**关键方法**：
- `configure(config)` - 设置日志系统
- `getLogger(category)` - 获取或创建日志器
- `isConfigured()` - 检查配置状态
- `shutdown(callback)` - 清理关闭

## 数据流

```
应用程序代码
    ↓
Logger.info('message')
    ↓
检查级别是否启用？
    ↓ (是)
创建 LoggingEvent
    ↓
对于每个输出器
    ↓
布局格式化事件
    ↓
输出到目标位置
```

## PM2 集群支持

### 进程识别

每个 LoggingEvent 自动包含进程 ID (`pid`)，这使得在 PM2 集群环境中识别来自不同工作进程的日志变得容易。

### 多进程日志记录

在 PM2 集群模式下运行时：

1. **自动进程 ID**: 每个日志事件都包含 `process.pid`
2. **PM2 环境变量**: 可以访问 `process.env.pm_id` 来获取 PM2 特定的进程 ID
3. **进程隔离**: 每个工作进程维护自己的日志器实例

### PM2 最佳实践

**1. 每个进程独立的日志文件**：
```typescript
const processId = process.env.pm_id || process.pid;
configure({
  appenders: {
    file: {
      type: 'file',
      filename: `./logs/app-${processId}.log`
    }
  }
});
```

**2. 控制台输出整合**：
PM2 自动整合来自所有进程的控制台输出，因此控制台输出器在集群模式下可以正常工作。

**3. 共享日志文件**：
如果使用共享日志文件，确保：
- 使用追加模式（默认）
- 考虑使用外部日志聚合系统
- 在模式中包含进程 ID 以识别来源

## 设计模式

### 1. 工厂模式
- `getLogger()` 创建或检索日志器
- `createAppender()` 实例化输出器

### 2. 策略模式
- 布局是可互换的格式化策略
- 输出器是可互换的输出策略

### 3. 单例模式
- `LoggerRegistry` 是单例
- 每个日志器分类都被缓存

### 4. 构建器模式
- 配置构建复杂的日志器设置

## 配置示例

### 基本控制台日志记录
```typescript
configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' }
  }
});
```

### 多输出器设置
```typescript
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
        pattern: '%d [%p] %c - %m' 
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' },
    app: { appenders: ['console', 'file'], level: 'DEBUG' },
    database: { appenders: ['file'], level: 'WARN' }
  }
});
```

### PM2 集群配置
```typescript
const processId = process.env.pm_id || process.pid;

configure({
  appenders: {
    console: { 
      type: 'console',
      layout: { type: 'colored' }
    },
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
```

## 扩展点

### 添加新输出器
1. 实现 `Appender` 接口
2. 从 `appenders/index.ts` 导出
3. 将类型添加到配置处理程序

### 添加新布局
1. 实现返回 `Layout` 的函数
2. 从 `layouts/index.ts` 导出
3. 在配置中添加支持

### 添加新日志级别
1. 创建新的 Level 实例
2. 添加到 `Level.levels` 数组
3. 如需要可以添加日志器方法

## 使用的 TypeScript 特性

- **严格类型检查**: 全程完整的类型安全
- **ES2022 语法**: 现代 JavaScript 特性
- **ESM 模块**: 原生 ES 模块支持
- **类型守卫**: 安全的类型缩小
- **联合类型**: 灵活的参数类型
- **只读属性**: 不可变数据
- **可选参数**: 灵活的 API

## 与 log4js-node 的区别

1. **纯 TypeScript**: 从头开始用 TS 构建
2. **ESM 模块**: 原生模块系统
3. **简化**: 专注于核心功能
4. **现代异步**: 使用 async/await 进行文件操作
5. **PM2 支持**: 原生支持 PM2 集群环境
6. **类型安全**: 完整的编译时类型检查

## 性能考虑

1. **级别检查**: 快速的数值比较
2. **延迟创建**: 按需创建日志器
3. **异步文件 I/O**: 非阻塞文件写入
4. **事件池**: 可为高吞吐场景添加
5. **PM2 集群**: 每个工作进程独立的日志器实例

## 未来增强

在保持当前架构的同时可能的添加：

1. **更多输出器**：
   - HTTP/网络输出器
   - 数据库输出器
   - Syslog 输出器

2. **高级布局**：
   - JSON 布局
   - XML 布局
   - 自定义格式字符串

3. **特性**：
   - 日志轮转
   - 日志过滤
   - 日志采样
   - 进程间通信优化

4. **开发体验**：
   - 插件系统
   - 配置验证
   - 热重载
   - 更好的错误消息

## PM2 集成最佳实践

### 日志聚合

对于生产环境，考虑：
1. 使用中央日志聚合服务
2. 为每个进程使用独立的日志文件
3. 使用 PM2 的日志管理功能
4. 实现日志轮转策略

### 性能优化

1. **异步写入**: 使用非阻塞文件操作
2. **批处理**: 考虑批量写入日志
3. **缓冲**: 实现日志缓冲以减少 I/O
4. **级别过滤**: 在生产环境中使用适当的日志级别

### 监控

1. **进程 ID 跟踪**: 在日志中包含进程 ID
2. **错误跟踪**: 监控错误率
3. **性能指标**: 跟踪日志吞吐量
4. **资源使用**: 监控文件大小和磁盘使用
