<template>
  <div class="home">
    <h1>{{ $t('common.home') }}</h1>
    <p>{{ $t('common.text7d5ifb') }}</p>
    <div class="content">
      <h2>{{ $t('common.textayfokg') }}</h2>
      <ul>
        <li>{{ $t('common.text2l0br1') }}</li>
        <li>{{ $t('common.textpa0ck0') }}</li>
        <li>{{ $t('common.textj1bqul') }}</li>
      </ul>
    </div>
    <button @click="handleClick">{{ $t('common.textccwk2c') }}</button>
    <p class="tip">{{ $t('common.textb78ln1') }}</p>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      title: i18n.t('common.textk07xw0'),
      message: i18n.t('common.textgq33pa')
    };
  },
  methods: {
    handleClick() {
      alert(i18n.t('common.texte3wm7p'));
      console.log(i18n.t('common.textujweu6'));
      //这里是注释
    },
    showMessage() {
      const text = i18n.t('common.textd1spvi');
      return text;
    }
  }
};</script>

<style scoped>
.home {
  padding: 20px;
}

h1 {
  color: #333;
}
</style>
