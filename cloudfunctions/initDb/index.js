/**
 * initDb - 数据库初始化云函数
 * 用于创建应用所需的数据库集合（Collection）
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { envId } = cloud.getWXContext();
  
  console.log(`开始初始化数据库... 环境: ${envId}`);
  
  try {
    // 需要创建的集合列表
    const collections = [
      {
        name: 'questions',
        description: '问题表 - 存储用户发布的问题',
        indexes: [
          { name: 'idx_createTime', field: 'createTime', order: 'desc' }
        ]
      },
      {
        name: 'answers',
        description: '答案表 - 存储问题的AI回答',
        indexes: [
          { name: 'idx_questionId', field: 'questionId', order: 'desc' },
          { name: 'idx_createTime', field: 'createTime', order: 'desc' }
        ]
      },
      {
        name: 'votes',
        description: '点赞记录表 - 存储用户点赞/取消点赞记录',
        indexes: [
          { name: 'idx_openid_target', field: 'openid', order: 'asc' },
          { name: 'idx_targetId', field: 'targetId', order: 'asc' }
        ]
      },
      {
        name: 'users',
        description: '用户表 - 存储用户信息',
        indexes: [
          { name: 'idx_createTime', field: 'createTime', order: 'desc' }
        ]
      }
    ];

    const results = {
      success: true,
      collections: [],
      errors: []
    };

    // 创建集合
    for (const col of collections) {
      try {
        console.log(`检查集合: ${col.name}`);
        
        // 使用 SDK 创建集合
        try {
          await db.createCollection(col.name);
          console.log(`✅ 创建集合成功: ${col.name}`);
        } catch (createErr) {
          if (createErr.errMsg.includes('collection already exists')) {
            console.log(`ℹ️ 集合已存在: ${col.name}`);
          } else {
            throw createErr;
          }
        }
        
        // 创建索引
        if (col.indexes && col.indexes.length > 0) {
          for (const idx of col.indexes) {
            try {
              await db.collection(col.name).addIndex({
                name: idx.name,
                fields: [{
                  field: idx.field,
                  direction: idx.order === 'desc' ? 'desc' : 'asc'
                }]
              });
              console.log(`  ✅ 索引创建成功: ${idx.name}`);
            } catch (idxErr) {
              if (idxErr.errMsg.includes('already exists')) {
                console.log(`  ℹ️ 索引已存在: ${idx.name}`);
              } else {
                console.log(`  ⚠️ 索引创建失败: ${idx.name} - ${idxErr.errMsg}`);
              }
            }
          }
        }
        
        results.collections.push({ name: col.name, status: 'ready' });
      } catch (err) {
        console.error(`❌ 处理集合失败: ${col.name}`, err);
        results.errors.push({ name: col.name, error: err.message });
      }
    }

    // 检查是否有未处理的错误
    if (results.errors.length > 0) {
      results.success = false;
      console.error('初始化过程中出现错误:', results.errors);
    }

    console.log('数据库初始化完成');
    
    return {
      success: results.success,
      envId,
      collections: results.collections,
      errors: results.errors,
      message: results.success 
        ? '数据库初始化完成，所有集合已就绪' 
        : '数据库初始化部分失败，请检查错误日志'
    };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      error: error.message,
      envId,
      message: '数据库初始化失败'
    };
  }
};
