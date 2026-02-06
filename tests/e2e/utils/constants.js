/**
 * 测试常量定义
 */

// 页面路径
const PAGES = {
  INDEX: 'pages/index/index',
  RESULT: 'pages/result/result',
  HISTORY: 'pages/history/history'
};

// 测试账号
const TEST_USER = {
  nickName: '测试用户',
  avatarUrl: 'https://example.com/avatar.png'
};

// 测试问题
const TEST_QUESTIONS = [
  '今天晚饭吃什么？',
  '周末去哪里玩？',
  '要不要表白？'
];

// 预期文本
const EXPECTED_TEXTS = {
  HOME: {
    TITLE: '狗头军师',
    SUBTITLE: '今天有什么烦心事？',
    PLACEHOLDER: '输入你的问题...',
    BUTTON_TEXT: '🔮 生成无厘头回复'
  },
  RESULT: {
    LABEL_QUESTION: '你的问题',
    LABEL_ANSWER: '狗头军师的回复',
    COPY_BUTTON: '📋 一键复制',
    LIKE_BUTTON: '👍 点赞',
    LIKE_BUTTON_LIKED: '❤️ 已赞',
    ASK_AGAIN: '🔄 再问一个',
    BACK: '返回'
  },
  HISTORY: {
    TITLE: '📜 历史记录',
    EMPTY_TEXT: '暂无历史记录',
    EMPTY_SUBTEXT: '去问狗头军师几个问题吧！',
    EMPTY_BUTTON: '去提问'
  }
};

// 按钮选择器
const SELECTORS = {
  GENERATE_BUTTON: '.generate-btn',
  COPY_BUTTON: '.copy-btn',
  LIKE_BUTTON: '.like-btn',
  ASK_AGAIN_BUTTON: '.ask-again-btn',
  BACK_BUTTON: '.back-btn',
  HISTORY_ENTRY: '.history-entry',
  HISTORY_ITEM: '.history-item',
  EMPTY_BUTTON: '.empty-btn',
  INPUT_FIELD: '.input-field',
  TOAST: '.toast'
};

module.exports = {
  PAGES,
  TEST_USER,
  TEST_QUESTIONS,
  EXPECTED_TEXTS,
  SELECTORS
};
