/**
 * PM2 集群环境使用示例
 * PM2 Cluster Environment Usage Example
 */
import { configure, getLogger } from './index.js';

// 检测 PM2 环境
const isPM2 = 'pm_id' in process.env;
const processId = process.env.pm_id || process.pid;

console.log(`=== PM2 环境示例 / PM2 Environment Example ===`);
console.log(`进程 ID / Process ID: ${process.pid}`);
console.log(`PM2 进程 ID / PM2 Process ID: ${process.env.pm_id || 'N/A'}`);
console.log(`PM2 环境 / PM2 Environment: ${isPM2 ? '是 / Yes' : '否 / No'}`);
console.log('');

// 配置日志系统 - 为每个进程使用独立的日志文件
// Configure logging system - use separate log file for each process
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
        pattern: '%d{ISO8601} [%p] [PID:%pid] [PM2:%pm_id] %c - %m'
      }
    }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'INFO' },
    app: { appenders: ['console', 'file'], level: 'DEBUG' }
  }
});

const logger = getLogger('app');

// 示例 1: 基本日志记录
console.log('=== 示例 1: 基本日志记录 / Example 1: Basic Logging ===');
logger.info('应用程序启动 / Application started');
logger.debug('调试信息 / Debug information');
logger.warn('警告消息 / Warning message');

// 示例 2: 带上下文的日志记录
console.log('\n=== 示例 2: 带上下文的日志记录 / Example 2: Logging with Context ===');
logger.addContext('workerId', processId);
logger.addContext('timestamp', Date.now());
logger.info('工作进程初始化 / Worker process initialized');

// 示例 3: 模拟业务操作
console.log('\n=== 示例 3: 业务操作日志 / Example 3: Business Operation Logs ===');
logger.info('处理用户请求 / Processing user request', { userId: '12345' });
logger.debug('查询数据库 / Querying database');
logger.info('请求处理完成 / Request processed successfully');

// 示例 4: 错误处理
console.log('\n=== 示例 4: 错误处理 / Example 4: Error Handling ===');
try {
  throw new Error('模拟错误 / Simulated error');
} catch (error) {
  logger.error('捕获到错误 / Error caught', error);
}

// PM2 特定信息
console.log('\n=== PM2 特定信息 / PM2 Specific Information ===');
if (isPM2) {
  logger.info('PM2 实例信息 / PM2 instance info', {
    pm_id: process.env.pm_id,
    name: process.env.name,
    exec_mode: process.env.exec_mode,
    instances: process.env.instances
  });
} else {
  logger.info('非 PM2 环境 / Not running in PM2 environment');
}

// 显示日志文件位置
console.log(`\n日志文件位置 / Log file location: ./logs/app-${processId}.log`);
console.log('示例完成 / Example completed!\n');
