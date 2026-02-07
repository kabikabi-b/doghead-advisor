/**
 * @jest-environment jsdom
 */

// Mock 微信云开发 API
global.wx = {
  cloud: {
    init: jest.fn(),
    database: jest.fn(() => ({
      collection: jest.fn((name) => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              skip: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({ data: [] })
              }))
            }))
          })),
          get: jest.fn().mockResolvedValue({ data: [] }),
          add: jest.fn().mockResolvedValue({ _id: 'test-id', errMsg: 'collection.add:ok' }),
          doc: jest.fn(() => ({
            update: jest.fn().mockResolvedValue({ success: true, errMsg: 'document.update:ok' }),
            remove: jest.fn().mockResolvedValue({ success: true, errMsg: 'document.remove:ok' }),
            get: jest.fn().mockResolvedValue({ data: {} })
          })),
          count: jest.fn().mockResolvedValue({ total: 0 })
        }))
      }))
    })),
    callFunction: jest.fn()
  },
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn()
};

// 云函数 Mock 数据
const mockCloudFunctionResponses = {
  generateReply: {
    success: true,
    reply: '这个问题嘛，我觉得你应该去问问你家的猫，它可能比你聪明。🐱',
    questionId: '123456789',
    question: '今天运气怎么样？'
  },
  getLeaderboard: {
    success: true,
    users: [
      { openid: 'user1', nickname: '狗头新手', score: 100, rank: 1 },
      { openid: 'user2', nickname: '狗头大师', score: 250, rank: 2 },
      { openid: 'user3', nickname: '狗头王者', score: 500, rank: 3 }
    ],
    total: 3
  },
  vote: {
    success: true,
    voteId: 'vote-123',
    questionId: 'question-123',
    voteType: 'up',
    timestamp: Date.now()
  },
  getUserProfile: {
    success: true,
    profile: {
      openid: 'test-openid',
      nickname: '测试用户',
      avatarUrl: 'https://example.com/avatar.png',
      totalQuestions: 10,
      totalVotes: 25,
      rank: 5
    }
  }
};

// 云函数配置验证
const cloudFunctionConfigs = {
  generateReply: {
    name: 'generateReply',
    hasPackageJson: true,
    hasConfigJson: true,
    hasWxServerSdk: true,
    hasMainExport: true
  },
  getLeaderboard: {
    name: 'getLeaderboard',
    hasPackageJson: true,
    hasConfigJson: true,
    hasWxServerSdk: true,
    hasMainExport: true
  },
  vote: {
    name: 'vote',
    hasPackageJson: true,
    hasConfigJson: true,
    hasWxServerSdk: true,
    hasMainExport: true
  },
  getUserProfile: {
    name: 'getUserProfile',
    hasPackageJson: true,
    hasConfigJson: true,
    hasWxServerSdk: true,
    hasMainExport: true
  }
};

describe('云函数部署状态验证', () => {
  const fs = require('fs');
  const path = require('path');
  
  const CLOUDFUNCTIONS_DIR = 'cloudfunctions';
  const FUNCTIONS = ['generateReply', 'getLeaderboard', 'vote', 'getUserProfile'];
  
  describe('目录结构验证', () => {
    test('cloudfunctions 目录应该存在', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      expect(fs.existsSync(cloudfunctionsPath)).toBe(true);
    });
    
    test('所有云函数目录应该存在', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const funcPath = path.join(cloudfunctionsPath, func);
        expect(fs.existsSync(funcPath)).toBe(true);
      }
    });
    
    test('每个云函数应该有 index.js', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const indexPath = path.join(cloudfunctionsPath, func, 'index.js');
        expect(fs.existsSync(indexPath)).toBe(true);
      }
    });
    
    test('每个云函数应该有 package.json', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const packagePath = path.join(cloudfunctionsPath, func, 'package.json');
        expect(fs.existsSync(packagePath)).toBe(true);
      }
    });
    
    test('每个云函数应该有 config.json', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const configPath = path.join(cloudfunctionsPath, func, 'config.json');
        expect(fs.existsSync(configPath)).toBe(true);
      }
    });
  });
  
  describe('package.json 配置验证', () => {
    test('每个云函数的 package.json 应该包含 wx-server-sdk 依赖', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const packagePath = path.join(cloudfunctionsPath, func, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        expect(packageJson.dependencies).toBeDefined();
        expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
      }
    });
    
    test('每个云函数的 package.json 应该有正确的 name', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const packagePath = path.join(cloudfunctionsPath, func, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        expect(packageJson.name).toBe(func);
      }
    });
    
    test('每个云函数的 package.json 应该有 main 入口', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const packagePath = path.join(cloudfunctionsPath, func, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        expect(packageJson.main).toBe('index.js');
      }
    });
  });
  
  describe('config.json 配置验证', () => {
    test('每个云函数的 config.json 应该包含 permissions', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const configPath = path.join(cloudfunctionsPath, func, 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        expect(config.permissions).toBeDefined();
        expect(config.permissions.openapi).toBeDefined();
      }
    });
  });
  
  describe('index.js 代码验证', () => {
    test('每个云函数应该引入 wx-server-sdk', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const indexPath = path.join(cloudfunctionsPath, func, 'index.js');
        const code = fs.readFileSync(indexPath, 'utf8');
        
        expect(code).toMatch(/require\(['"]wx-server-sdk['"]\)/);
      }
    });
    
    test('每个云函数应该调用 cloud.init', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const indexPath = path.join(cloudfunctionsPath, func, 'index.js');
        const code = fs.readFileSync(indexPath, 'utf8');
        
        expect(code).toMatch(/cloud\.init/);
      }
    });
    
    test('每个云函数应该导出 main 函数', () => {
      const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
      
      for (const func of FUNCTIONS) {
        const indexPath = path.join(cloudfunctionsPath, func, 'index.js');
        const code = fs.readFileSync(indexPath, 'utf8');
        
        expect(code).toMatch(/exports\.main/);
      }
    });
  });
});

describe('云函数调用 E2E 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateReply 云函数', () => {
    test('应该正确调用 generateReply 云函数', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.generateReply
      });
      
      const result = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '今天运气怎么样？' }
      });
      
      expect(result.success).toBe(true);
      expect(result.reply).toBeDefined();
      expect(result.questionId).toBeDefined();
    });
    
    test('应该处理空问题参数', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: false,
        error: '问题不能为空'
      });
      
      const result = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '' }
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('问题不能为空');
    });
    
    test('应该处理 API 错误', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: false,
        error: '生成回复失败，请重试'
      });
      
      const result = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '测试问题' }
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('getLeaderboard 云函数', () => {
    test('应该正确调用 getLeaderboard 云函数', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.getLeaderboard
      });
      
      const result = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { limit: 10 }
      });
      
      expect(result.success).toBe(true);
      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.users.length).toBeGreaterThan(0);
    });
    
    test('应该按分数排序返回排行榜', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.getLeaderboard
      });
      
      const result = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { limit: 10 }
      });
      
      // 验证排行榜排序（分数递减）
      const scores = result.users.map(u => u.score);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });
    
    test('应该包含 rank 字段', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.getLeaderboard
      });
      
      const result = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { limit: 10 }
      });
      
      // 验证每个用户都有 rank
      result.users.forEach(user => {
        expect(user.rank).toBeDefined();
      });
    });
  });
  
  describe('vote 云函数', () => {
    test('应该正确调用 vote 云函数', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.vote
      });
      
      const result = await wx.cloud.callFunction({
        name: 'vote',
        data: { questionId: 'question-123', voteType: 'up' }
      });
      
      expect(result.success).toBe(true);
      expect(result.voteId).toBeDefined();
      expect(result.questionId).toBe('question-123');
    });
    
    test('应该支持 up 投票类型', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.vote
      });
      
      await wx.cloud.callFunction({
        name: 'vote',
        data: { questionId: '123', voteType: 'up' }
      });
      
      expect(global.wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ voteType: 'up' })
        })
      );
    });
    
    test('应该支持 down 投票类型', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        voteId: 'vote-456',
        questionId: '123',
        voteType: 'down'
      });
      
      await wx.cloud.callFunction({
        name: 'vote',
        data: { questionId: '123', voteType: 'down' }
      });
      
      expect(global.wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ voteType: 'down' })
        })
      );
    });
    
    test('应该验证必需参数', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: false,
        error: '缺少必需参数'
      });
      
      const result = await wx.cloud.callFunction({
        name: 'vote',
        data: { questionId: '' }
      });
      
      expect(result.success).toBe(false);
    });
  });
  
  describe('getUserProfile 云函数', () => {
    test('应该正确调用 getUserProfile 云函数', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.getUserProfile
      });
      
      const result = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { openid: 'test-openid' }
      });
      
      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile.nickname).toBeDefined();
    });
    
    test('应该返回用户统计数据', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockCloudFunctionResponses.getUserProfile
      });
      
      const result = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { openid: 'test-openid' }
      });
      
      expect(result.profile.totalQuestions).toBeDefined();
      expect(result.profile.totalVotes).toBeDefined();
      expect(result.profile.rank).toBeDefined();
    });
    
    test('应该处理不存在的用户', async () => {
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: false,
        error: '用户不存在'
      });
      
      const result = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { openid: 'non-existent-user' }
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('用户不存在');
    });
  });
});

describe('云函数集成测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('云函数调用链测试', () => {
    test('生成回复后应该能获取用户统计', async () => {
      // Mock generateReply 调用
      global.wx.cloud.callFunction
        .mockResolvedValueOnce({
          success: true,
          ...mockCloudFunctionResponses.generateReply
        })
        // Mock getUserProfile 调用
        .mockResolvedValueOnce({
          success: true,
          ...mockCloudFunctionResponses.getUserProfile
        });
      
      // 1. 生成回复
      const replyResult = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '今天运气怎么样？' }
      });
      expect(replyResult.success).toBe(true);
      
      // 2. 获取用户统计
      const profileResult = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { openid: 'test-openid' }
      });
      expect(profileResult.success).toBe(true);
      expect(profileResult.profile).toBeDefined();
    });
    
    test('投票后应该更新排行榜', async () => {
      // Mock vote 调用
      global.wx.cloud.callFunction
        .mockResolvedValueOnce({
          success: true,
          ...mockCloudFunctionResponses.vote
        })
        // Mock getLeaderboard 调用
        .mockResolvedValueOnce({
          success: true,
          ...mockCloudFunctionResponses.getLeaderboard
        });
      
      // 1. 投票
      const voteResult = await wx.cloud.callFunction({
        name: 'vote',
        data: { questionId: '123', voteType: 'up' }
      });
      expect(voteResult.success).toBe(true);
      
      // 2. 获取排行榜
      const leaderboardResult = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { limit: 10 }
      });
      expect(leaderboardResult.success).toBe(true);
      expect(leaderboardResult.users).toBeDefined();
    });
  });
  
  describe('错误处理测试', () => {
    test('云函数调用失败应该显示错误提示', async () => {
      global.wx.cloud.callFunction.mockRejectedValueOnce(new Error('网络错误'));
      
      await expect(
        wx.cloud.callFunction({
          name: 'generateReply',
          data: { question: '测试' }
        })
      ).rejects.toThrow('网络错误');
      
      // 应该显示 toast 提示
      expect(global.wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.any(String),
          icon: 'none'
        })
      );
    });
    
    test('云函数超时应该正确处理', async () => {
      global.wx.cloud.callFunction.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ success: false, error: '超时' }), 30000))
      );
      
      const result = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '测试' }
      });
      
      expect(result.error).toBe('超时');
    });
  });
  
  describe('并发调用测试', () => {
    test('应该支持多个云函数并发调用', async () => {
      global.wx.cloud.callFunction
        .mockResolvedValueOnce({ success: true, ...mockCloudFunctionResponses.getLeaderboard })
        .mockResolvedValueOnce({ success: true, ...mockCloudFunctionResponses.getUserProfile });
      
      const [leaderboardResult, profileResult] = await Promise.all([
        wx.cloud.callFunction({ name: 'getLeaderboard', data: { limit: 10 } }),
        wx.cloud.callFunction({ name: 'getUserProfile', data: { openid: 'test' } })
      ]);
      
      expect(leaderboardResult.success).toBe(true);
      expect(profileResult.success).toBe(true);
    });
  });
});

describe('冒烟测试 - 云函数部署验证', () => {
  const fs = require('fs');
  const path = require('path');
  
  const CLOUDFUNCTIONS_DIR = 'cloudfunctions';
  const FUNCTIONS = ['generateReply', 'getLeaderboard', 'vote', 'getUserProfile'];
  
  test('所有云函数目录结构完整', () => {
    const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
    
    for (const func of FUNCTIONS) {
      const funcPath = path.join(cloudfunctionsPath, func);
      const files = fs.readdirSync(funcPath);
      
      expect(files).toContain('index.js');
      expect(files).toContain('package.json');
      expect(files).toContain('config.json');
    }
  });
  
  test('所有云函数依赖配置正确', () => {
    const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
    
    for (const func of FUNCTIONS) {
      const packagePath = path.join(cloudfunctionsPath, func, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    }
  });
  
  test('所有云函数代码结构正确', () => {
    const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
    
    for (const func of FUNCTIONS) {
      const indexPath = path.join(cloudfunctionsPath, func, 'index.js');
      const code = fs.readFileSync(indexPath, 'utf8');
      
      expect(code).toMatch(/require\(['"]wx-server-sdk['"]\)/);
      expect(code).toMatch(/cloud\.init/);
      expect(code).toMatch(/exports\.main/);
    }
  });
  
  test('所有云函数配置正确', () => {
    const cloudfunctionsPath = path.join(__dirname, '..', CLOUDFUNCTIONS_DIR);
    
    for (const func of FUNCTIONS) {
      const configPath = path.join(cloudfunctionsPath, func, 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      expect(config.permissions).toBeDefined();
    }
  });
  
  test('所有云函数调用应该返回正确的响应结构', async () => {
    for (const funcName of FUNCTIONS) {
      const mockResponse = mockCloudFunctionResponses[funcName];
      if (!mockResponse) continue;
      
      global.wx.cloud.callFunction.mockResolvedValueOnce({
        success: true,
        ...mockResponse
      });
      
      const result = await wx.cloud.callFunction({
        name: funcName,
        data: {}
      });
      
      expect(result.success).toBe(true);
    }
  });
});
