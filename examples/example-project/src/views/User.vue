<template>
  <div class="user">
    <h1>{{ $t('common.textf6y6dw') }}</h1>
    <div class="user-info">
      <p>{{ $t('common.textkeeudz', { username: username }) }}</p>
      <p>{{ $t('common.textrgxi18', { username: username }) }}</p>
      <p>{{ $t('common.text7cxfoy', { count: count }) }}</p>
    </div>
    <div class="actions">
      <button>{{ $t('common.edit') }}</button>
      <button>{{ $t('common.delete') }}</button>
      <button>{{ $t('common.save') }}</button>
    </div>
    <input type="text" placeholder="{{ $t('common.text7grhuz') }}" />
    <input type="password" placeholder="{{ $t('common.text2j9vj0') }}" />
  </div>
</template>

<script>
export default {
  name: 'User',
  data() {
    return {
      username: i18n.t('common.textglwp'),
      count: 5,
      status: i18n.t('common.textfiqf')
    };
  },
  methods: {
    formatMessage() {
      const username = this.username;
      const count = this.count;
      return i18n.t('common.text57ohvk', { username, count });
    },
    showAlert() {
      alert(i18n.t('common.textd1spvi'));
    }
  },
  computed: {
    welcomeMessage() {
      return i18n.t('common.text57ohvk', { username, count });
    }
  }
};</script>

<style scoped>
.user {
  padding: 20px;
}

.actions button {
  margin-right: 10px;
}
</style>
