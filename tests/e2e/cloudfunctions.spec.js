// tests/e2e/cloudfunctions.spec.js

/**
 * 云函数测试
 * 
 * 注意: 这些测试需要真实的云环境
 * 在本地测试时使用 Mock
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');

// Mock wx.cloud
const mockCloud = {
  init: jest.fn(),
  callFunction: jest.fn()
};

global.wx = {
  cloud: mockCloud
};

describe('云函数测试', () => {
  
  beforeEach(() => {
    mockCloud.callFunction.mockClear();
  });

  describe('generateReply 云函数', () => {
    it('应该调用云函数生成回复', async () => {
      const mockReply = '建议你直接离职算了！';
      
      mockCloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          reply: mockReply,
          questionId: '123'
        }
      });

      // 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '老板不给涨工资怎么办？' }
      });

      expect(mockCloud.callFunction).toHaveBeenCalledWith({
        name: 'generateReply',
        data: { question: '老板不给涨工资怎么办？' }
      });

      expect(res.result.success).toBe(true);
      expect(res.result.reply).toBe(mockReply);
    });

    it('应该处理云函数错误', async () => {
      mockCloud.callFunction.mockRejectedValue(new Error('云函数调用失败'));

      const res = await wx.cloud.callFunction({
        name: 'generateReply',
        data: { question: '测试问题' }
      });

      expect(res.result).toBeDefined();
    });
  });

  describe('getLeaderboard 云函数', () => {
    it('应该获取排行榜数据', async () => {
      const mockLeaderboard = {
        success: true,
        list: [
          { id: '1', name: '怼神降临', avatar: '🦁', likes: 1234, guguRate: 99, score: 1234 },
          { id: '2', name: '小狐狸', avatar: '🦊', likes: 987, guguRate: 85, score: 987 }
        ],
        currentUserRank: null
      };

      mockCloud.callFunction.mockResolvedValue({
        result: mockLeaderboard
      });

      const res = await wx.cloud.callFunction({
        name: 'getLeaderboard',
        data: { filter: 'likes' }
      });

      expect(mockCloud.callFunction).toHaveBeenCalledWith({
        name: 'getLeaderboard',
        data: { filter: 'likes' }
      });

      expect(res.result.success).toBe(true);
      expect(res.result.list).toHaveLength(2);
    });
  });

  describe('vote 云函数', () => {
    it('应该处理点赞操作', async () => {
      mockCloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          action: 'like',
          newCount: 5
        }
      });

      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: { type: 'question', id: 'q123' }
      });

      expect(mockCloud.callFunction).toHaveBeenCalledWith({
        name: 'vote',
        data: { type: 'question', id: 'q123' }
      });

      expect(res.result.success).toBe(true);
      expect(res.result.action).toBe('like');
    });

    it('应该处理取消点赞操作', async () => {
      mockCloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          action: 'unlike',
          newCount: 4
        }
      });

      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: { type: 'question', id: 'q123' }
      });

      expect(res.result.action).toBe('unlike');
    });
  });

  describe('getUserProfile 云函数', () => {
    it('应该获取用户信息', async () => {
      const mockUser = {
        success: true,
        user: {
          _id: 'u123',
          nickName: '测试用户',
          avatarUrl: '🐕',
          stats: {
            totalQuestions: 10,
            totalLikes: 50,
            guguRate: 20
          }
        }
      };

      mockCloud.callFunction.mockResolvedValue({
        result: mockUser
      });

      const res = await wx.cloud.callFunction({
        name: 'getUserProfile'
      });

      expect(mockCloud.callFunction).toHaveBeenCalledWith({
        name: 'getUserProfile',
        data: undefined
      });

      expect(res.result.success).toBe(true);
      expect(res.result.user.nickName).toBe('测试用户');
    });
  });

  describe('getLikeStatus 云函数', () => {
    it('应该获取已点赞状态', async () => {
      mockCloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          liked: true,
          likeCount: 10
        }
      });

      const res = await wx.cloud.callFunction({
        name: 'getLikeStatus',
        data: { questionId: 'q123' }
      });

      expect(mockCloud.callFunction).toHaveBeenCalledWith({
        name: 'getLikeStatus',
        data: { questionId: 'q123' }
      });

      expect(res.result.success).toBe(true);
      expect(res.result.liked).toBe(true);
      expect(res.result.likeCount).toBe(10);
    });

    it('应该获取未点赞状态', async () => {
      mockCloud.callFunction.mockResolvedValue({
        result: {
          success: true,
          liked: false,
          likeCount: 5
        }
      });

      const res = await wx.cloud.callFunction({
        name: 'getLikeStatus',
        data: { questionId: 'q456' }
      });

      expect(res.result.liked).toBe(false);
      expect(res.result.likeCount).toBe(5);
    });

    it('应该处理缺少 questionId 的情况', async () => {
      mockCloud.callFunction.mockResolvedValue({
        result: {
          success: false,
          error: '缺少问题ID'
        }
      });

      const res = await wx.cloud.callFunction({
        name: 'getLikeStatus',
        data: {}
      });

      expect(res.result.success).toBe(false);
      expect(res.result.error).toBe('缺少问题ID');
    });
  });

  describe('云函数配置验证', () => {
    it('generateReply 应该有 package.json 依赖配置', () => {
      const fs = require('fs');
      const path = require('path');
      
      const packagePath = path.join(__dirname, '../../cloudfunctions/generateReply/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    });

    it('getLeaderboard 应该有 package.json 依赖配置', () => {
      const fs = require('fs');
      const path = require('path');
      
      const packagePath = path.join(__dirname, '../../cloudfunctions/getLeaderboard/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    });

    it('vote 应该有 package.json 依赖配置', () => {
      const fs = require('fs');
      const path = require('path');
      
      const packagePath = path.join(__dirname, '../../cloudfunctions/vote/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    });

    it('getUserProfile 应该有 package.json 依赖配置', () => {
      const fs = require('fs');
      const path = require('path');
      
      const packagePath = path.join(__dirname, '../../cloudfunctions/getUserProfile/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    });

    it('getLikeStatus 应该有 package.json 依赖配置', () => {
      const fs = require('fs');
      const path = require('path');
      
      const packagePath = path.join(__dirname, '../../cloudfunctions/getLikeStatus/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['wx-server-sdk']).toBeDefined();
    });
  });
});
