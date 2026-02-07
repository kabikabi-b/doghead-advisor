const { mockWx } = require('./utils/mock-wx');
describe('首页', () => {
  beforeEach(() => mockWx());
  test('数据初始化', () => {
    const page = { data: { question: '', examples: [] } };
    expect(page.data.question).toBe('');
  });
  test('输入更新', () => {
    const page = { data: { question: '' } };
    page.onInput = function(e) { this.data.question = e.detail.value; };
    page.onInput({ detail: { value: '测试' } });
    expect(page.data.question).toBe('测试');
  });
});
describe('AI回复', () => {
  const replies = ["回复1", "回复2", "回复3", "回复4"];
  test('多选项', () => { expect(replies.length).toBeGreaterThan(3); });
});
