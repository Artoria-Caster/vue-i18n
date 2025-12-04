import i18n from './i18n/index';
// 测试文件：验证 console.log 和注释过滤功能

// 这是一个注释，包含中文，不应该被提取
const message = i18n.t('common.textkmntm7');

/* 
 * 这是多行注释
 * 包含中文文本
 * 不应该被提取
 */
const title = i18n.t('common.textdr706u'); // 这个应该被提取

function testConsoleFilter() {
  // console.log 中的中文不应该被提取
  console.log('调试信息：开始执行');
  console.warn('警告：这是警告信息');
  console.error('错误：发生了错误');
  console.info('提示信息');
  console.debug('调试详情');

  // 普通的字符串应该被提取
  const successMsg = i18n.t('common.textd1spvi');
  const errorMsg = i18n.t('common.textd1rj43');

  // alert 和其他函数中的中文应该被提取
  alert(i18n.t('common.textkmntm7'));

  return {
    success: i18n.t('common.texth4sv'),
    failed: i18n.t('common.textfy1g')
  };
}

// 模板字符串测试
function testTemplateString(username) {
  // console 中的模板字符串不应该被提取
  console.log(`用户 ${username} 登录成功`);

  // 普通的模板字符串应该被提取
  const welcomeMsg = i18n.t('common.textdr5hv1', { username: username });

  return welcomeMsg;
}

// 条件语句中的中文
function testCondition(status) {
  // 注释：这里的逻辑判断状态
  if (status === 'success') {
    console.log('状态检查：成功'); // 这个不应该被提取
    return i18n.t('common.textbpnma9'); // 这个应该被提取
  } else {
    console.error('状态检查：失败');
    return i18n.t('common.textbpmfiu');
  }
}

/**
 * JSDoc 注释
 * 这里的中文也不应该被提取
 * @param {string} name - 用户名称
 * @returns {string} 返回值描述
 */
function greet(name) {
  return i18n.t('common.textr0yfwm', { name: name });
}

export default {
  testConsoleFilter,
  testTemplateString,
  testCondition,
  greet
};