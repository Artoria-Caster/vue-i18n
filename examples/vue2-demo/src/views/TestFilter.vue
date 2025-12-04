<template>
  <div class="test-filter">
    <!-- 这是 HTML 注释，包含中文，不应该被提取 -->
    <h1>{{ $t('common.textedhddj') }}</h1>
    
    <!-- 
      多行 HTML 注释
      也包含中文
      也不应该被提取
    -->
    <div class="content">
      <p>{{ $t('common.text965tip') }}</p>
      <button>{{ $t('common.submit') }}</button>
      <span>{{ message }}</span>
    </div>
    
    <!-- 下面是表单 -->
    <el-form>
      <el-form-item :label="$t('common.texthmxge')">
        <el-input :placeholder="$t('common.text7grhuz')" />
      </el-form-item>
      <el-form-item :label="$t('common.textg9ob')">
        <el-input type="password" :placeholder="$t('common.text2j9vj0')" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'TestFilter',
  data() {
    return {
      // 这是数据注释，不应该被提取
      message: this.$t('common.text8m7jif'), // 这个应该被提取
      title: this.$t('common.textdr3jet')
    };
  },
  methods: {
    handleSubmit() {
      // 提交逻辑注释
      console.log('表单提交：开始验证'); // console 中的不应该被提取

      if (this.validateForm()) {
        console.log('验证通过');
        this.$message.success(this.$t('common.textcx7dr7')); // 这个应该被提取
      } else {
        console.error('验证失败：表单数据不完整');
        this.$message.error(this.$t('common.textcx66zs')); // 这个应该被提取
      }
    },

    /**
     * 表单验证方法
     * 中文 JSDoc 注释也不应该被提取
     */
    validateForm() {
      // 执行验证逻辑
      console.log('执行验证');
      return true;
    }
  }
};</script>

<style scoped>
/* CSS 注释中的中文 */
.test-filter {
  padding: 20px;
}

/* 
 * 多行 CSS 注释
 * 包含中文
 */
.content {
  margin-top: 20px;
}
</style>
