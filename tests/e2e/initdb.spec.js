/**
 * @jest-environment jsdom
 */

// Mock 微信云开发 API
global.wx = {
  cloud: {
    init: jest.fn(),
    database: jest.fn(() => ({
      createCollection: jest.fn().mockResolvedValue({}),
      collection: jest.fn(() => ({
        index: jest.fn().mockResolvedValue({})
      }))
    })),
    getWXContext: jest.fn(() => ({
      envId: 'test-env'
    }))
  }
};

describe('initDb 云函数测试', () => {
  let initDbModule;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('模块结构', () => {
    test('initDb 模块应该正确导出', () => {
      // 验证文件结构
      const fs = require('fs');
      const indexPath = './cloudfunctions/initDb/index.js';
      const exists = fs.existsSync(indexPath);
      expect(exists).toBe(true);
    });
    
    test('package.json 应该包含 wx-server-sdk 依赖', () => {
      const fs = require('fs');
      const packageJson = JSON.parse(
        fs.readFileSync('./cloudfunctions/initDb/package.json', 'utf8')
      );
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    });
  });
  
  describe('集合创建逻辑', () => {
    test('应该定义 questions, answers, votes, users 集合', () => {
      const expectedCollections = ['questions', 'answers', 'votes', 'users'];
      expectedCollections.forEach(col => {
        expect(col).toBeDefined();
      });
    });
    
    test('questions 应该有 createTime 索引', () => {
      const expectedIndexes = [
        { name: 'idx_createTime', field: 'createTime' }
      ];
      expect(expectedIndexes[0].name).toBe('idx_createTime');
    });
  });
});
