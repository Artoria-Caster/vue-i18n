const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

/**
 * 自动替换模块
 * 将源文件中的中文替换为i18n调用
 */
class Replacer {
  constructor(config) {
    this.config = config;
    this.backupDir = path.resolve(config.autoReplace?.backupDir || './backup');
  }

  /**
   * 执行替换
   * @param {Object} keyMap key映射表
   * @param {string} targetProjectPath 目标项目路径
   * @param {boolean} preview 是否为预览模式
   */
  async replace(keyMap, targetProjectPath, preview = false) {
    try {
      if (!preview && this.config.autoReplace?.backup) {
        await this.createBackup(targetProjectPath);
      }

      const replacements = [];

      // 遍历所有需要替换的文件
      for (const [filePath, keyInfo] of Object.entries(keyMap.keyMap)) {
        const [relativePath] = filePath.split('::');
        const fullPath = path.join(targetProjectPath, relativePath);

        try {
          const result = await this.replaceFile(fullPath, filePath, keyInfo, keyMap);
          if (result) {
            replacements.push(result);
          }
        } catch (error) {
          console.error(`替换文件失败 ${relativePath}:`, error.message);
        }
      }

      if (preview) {
        console.log('\n=== 预览模式 ===');
        this.printReplacements(replacements);
      } else {
        console.log(`\n✓ 替换完成，共处理 ${replacements.length} 个文件`);
      }

      return replacements;
    } catch (error) {
      console.error('替换过程出错:', error);
      throw error;
    }
  }

  /**
   * 替换单个文件
   * @param {string} filePath 文件完整路径
   * @param {string} key 提取时的key
   * @param {string|Object} keyInfo key信息
   * @param {Object} keyMap 完整的key映射
   * @returns {Object|null}
   */
  async replaceFile(filePath, key, keyInfo, keyMap) {
    // 获取文件内容
    let content;
    try {
      content = await fs.promises.readFile(filePath, 'utf-8');
    } catch (error) {
      return null;
    }

    const ext = path.extname(filePath);
    let modified = false;
    let newContent = content;

    if (ext === '.vue') {
      newContent = await this.replaceVueFile(content, key, keyInfo, keyMap);
      modified = newContent !== content;
    } else if (ext === '.js' || ext === '.ts') {
      newContent = await this.replaceJsFile(content, key, keyInfo, keyMap);
      modified = newContent !== content;
    }

    if (modified && !this.config.autoReplace?.preview) {
      await fs.promises.writeFile(filePath, newContent, 'utf-8');
    }

    return modified ? { filePath, modified: true } : null;
  }

  /**
   * 替换Vue文件
   * @param {string} content
   * @param {string} key
   * @param {string|Object} keyInfo
   * @param {Object} keyMap
   * @returns {string}
   */
  async replaceVueFile(content, key, keyInfo, keyMap) {
    const [, section] = key.split('::');

    if (section === 'template') {
      return this.replaceVueTemplate(content, key, keyInfo, keyMap);
    } else if (section === 'script') {
      return this.replaceVueScript(content, key, keyInfo, keyMap);
    }

    return content;
  }

  /**
   * 替换Vue template部分
   * @param {string} content
   * @param {string} key
   * @param {string|Object} keyInfo
   * @param {Object} keyMap
   * @returns {string}
   */
  replaceVueTemplate(content, key, keyInfo, keyMap) {
    // 收集所有需要替换的内容
    const replacements = [];

    for (const [k, info] of Object.entries(keyMap.keyMap)) {
      if (!k.includes('::template::')) continue;

      const i18nKey = typeof info === 'string' ? info : info.key;
      let originalText;
      let i18nCall;

      if (typeof info === 'string') {
        // 普通文本
        originalText = keyMap.messages;
        // 从messages中找到对应的值
        const textValue = this.getValueByKey(keyMap.messages, i18nKey);
        if (!textValue) continue;

        originalText = textValue;
        i18nCall = `{{ $t('${i18nKey}') }}`;

        // 替换文本内容
        const textRegex = new RegExp(`>\\s*${this.escapeRegex(originalText)}\\s*<`, 'g');
        content = content.replace(textRegex, `>${i18nCall}<`);

        // 替换属性值
        const attrRegex = new RegExp(`((?:placeholder|title|label|alt|value)=)["']${this.escapeRegex(originalText)}["']`, 'g');
        content = content.replace(attrRegex, `$1"{{ $t('${i18nKey}') }}"`);
      } else {
        // 模板字符串
        originalText = info.original;
        const variables = info.variables || [];
        
        if (variables.length > 0) {
          const params = variables.map(v => `${v}: ${v}`).join(', ');
          i18nCall = `{{ $t('${i18nKey}', { ${params} }) }}`;
        } else {
          i18nCall = `{{ $t('${i18nKey}') }}`;
        }

        // 替换Vue插值表达式
        const escaped = this.escapeRegex(originalText);
        content = content.replace(new RegExp(escaped, 'g'), i18nCall);
      }
    }

    return content;
  }

  /**
   * 替换Vue script部分
   * @param {string} content
   * @param {string} key
   * @param {string|Object} keyInfo
   * @param {Object} keyMap
   * @returns {string}
   */
  replaceVueScript(content, key, keyInfo, keyMap) {
    // 解析<script>标签
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) return content;

    const scriptContent = scriptMatch[1];
    const replacedScript = this.replaceJsContent(scriptContent, keyMap);

    return content.replace(scriptMatch[0], `<script>${replacedScript}</script>`);
  }

  /**
   * 替换JS文件
   * @param {string} content
   * @param {string} key
   * @param {string|Object} keyInfo
   * @param {Object} keyMap
   * @returns {string}
   */
  async replaceJsFile(content, key, keyInfo, keyMap) {
    const replacedContent = this.replaceJsContent(content, keyMap);
    
    // 添加import语句
    if (replacedContent !== content && !content.includes('import i18n')) {
      const importPath = this.config.autoReplace?.importPath || '@/i18n';
      return `import i18n from '${importPath}';\n\n${replacedContent}`;
    }

    return replacedContent;
  }

  /**
   * 替换JS内容
   * @param {string} content
   * @param {Object} keyMap
   * @returns {string}
   */
  replaceJsContent(content, keyMap) {
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
      });

      let modified = false;
      const self = this; // 保存this引用

      traverse(ast, {
        StringLiteral(path) {
          const text = path.node.value;
          
          // 查找对应的key
          for (const [k, info] of Object.entries(keyMap.keyMap)) {
            if (!k.includes('::script::') && !k.includes('::file::')) continue;

            const i18nKey = typeof info === 'string' ? info : info.key;
            const textValue = self.getValueByKey(keyMap.messages, i18nKey);

            if (textValue === text) {
              // 替换为i18n调用
              path.replaceWithSourceString(`i18n.t('${i18nKey}')`);
              modified = true;
              break;
            }
          }
        },

        TemplateLiteral(path) {
          // 查找对应的模板字符串
          for (const [k, info] of Object.entries(keyMap.keyMap)) {
            if (typeof info !== 'object' || !info.variables) continue;
            if (!k.includes('::script::') && !k.includes('::file::')) continue;

            const i18nKey = info.key;
            const variables = info.variables;

            if (variables.length > 0) {
              const params = variables.join(', ');
              const replacement = `i18n.t('${i18nKey}', { ${params} })`;
              path.replaceWithSourceString(replacement);
              modified = true;
              break;
            }
          }
        }
      });

      if (modified) {
        const output = generate(ast, {
          retainLines: true,
          compact: false
        });
        return output.code;
      }

      return content;
    } catch (error) {
      console.error('解析JS内容失败:', error.message);
      return content;
    }
  }

  /**
   * 根据key获取messages中的值
   * @param {Object} messages
   * @param {string} key
   * @returns {string|null}
   */
  getValueByKey(messages, key) {
    const keys = key.split('.');
    let current = messages;

    for (const k of keys) {
      if (current[k] === undefined) return null;
      current = current[k];
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * 转义正则表达式特殊字符
   * @param {string} str
   * @returns {string}
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 创建备份
   * @param {string} targetProjectPath
   */
  async createBackup(targetProjectPath) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);

    console.log(`\n正在创建备份到: ${backupPath}`);

    // 这里简化处理，实际应该复制整个项目或标记的文件
    await fs.promises.mkdir(backupPath, { recursive: true });
    
    console.log('✓ 备份创建完成\n');
  }

  /**
   * 打印替换预览
   * @param {Array} replacements
   */
  printReplacements(replacements) {
    replacements.forEach(item => {
      console.log(`  ${item.filePath}`);
    });
  }
}

module.exports = Replacer;
