<template>
  <button :class="type" @click="handleClick">
    <slot>{{ text }}</slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    text: {
      type: String,
      default: i18n.t('common.texthnt1')
    }
  },
  methods: {
    handleClick() {
      this.$emit('click');
      console.log(i18n.t('common.textd404br'));
    }
  }
};</script>

<style scoped>
button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background: #409eff;
  color: white;
}
</style>
