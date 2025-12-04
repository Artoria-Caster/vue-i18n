import i18n from '@/i18n';

/**
 * 消息工具类
 */

export const MessageType = {
  SUCCESS: i18n.t('common.texth4sv'),
  ERROR: i18n.t('common.textq4mu'),
  WARNING: i18n.t('common.texto690'),
  INFO: i18n.t('common.texte46m')
};

export function showMessage(message, type = 'info') {
  console.log(i18n.t('common.text57ohvk', { username, count }));
}

export function showSuccess() {
  return i18n.t('common.textd1spvi');
}

export function showError() {
  return i18n.t('common.textd1rj43');
}

export function formatUserMessage(username, action) {
  return i18n.t('common.text57ohvk', { username, count });
}

export const messages = {
  welcome: i18n.t('common.text8m7jif'),
  goodbye: i18n.t('common.texteml0'),
  confirm: i18n.t('common.textfrrm3p'),
  cancel: i18n.t('common.textb175ep')
};

// 带变量的消息模板
export function getWelcomeMessage(name) {
  return i18n.t('common.text57ohvk', { username, count });
}

export function getTotalMessage(total) {
  return i18n.t('common.text57ohvk', { username, count });
}