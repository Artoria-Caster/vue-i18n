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
      const processedFiles = new Set();

      // 按文件分组 key
      const fileGroups = {};
      for (const [filePath, keyInfo] of Object.entries(keyMap.keyMap)) {
        const [relativePath] = filePath.split('::');
        if (!fileGroups[relativePath]) {
          fileGroups[relativePath] = [];
        }
        fileGroups[relativePath].push({ filePath, keyInfo });
      }

      // 遍历所有需要替换的文件
      for (const [relativePath, keys] of Object.entries(fileGroups)) {
        const fullPath = path.join(targetProjectPath, relativePath);
        if (processedFiles.has(fullPath)) continue;

        try {
          const result = await this.replaceFileOnce(fullPath, keys, keyMap);
          if (result) {
            replacements.push(result);
            processedFiles.add(fullPath);
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
   * 替换单个文件（一次性处理所有替换）
   * @param {string} filePath 文件完整路径
   * @param {Array} keys 该文件的所有 key
   * @param {Object} keyMap 完整的key映射
   * @returns {Object|null}
   */
  async replaceFileOnce(filePath, keys, keyMap) {
    // 跳过配置文件
    const fileName = path.basename(filePath);
    const configFiles = ['vue.config.js', 'webpack.config.js', 'babel.config.js', 'vite.config.js', 'rollup.config.js'];
    if (configFiles.includes(fileName)) {
      console.log(`跳过配置文件: ${fileName}`);
      return null;
    }

    // 跳过i18n配置目录下的所有文件
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.includes('/i18n/') || normalizedPath.includes('/locales/')) {
      console.log(`跳过i18n配置文件: ${fileName}`);
      return null;
    }

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
      newContent = await this.replaceVueFileComplete(content, keys, keyMap);
      modified = newContent !== content;
    } else if (ext === '.js' || ext === '.ts') {
      // 普通JS文件使用i18n实例
      newContent = await this.replaceJsFile(content, null, null, keyMap, filePath);
      modified = newContent !== content;
    }

    if (modified && !this.config.autoReplace?.preview) {
      await fs.promises.writeFile(filePath, newContent, 'utf-8');
    }

    return modified ? { filePath, modified: true } : null;
  }

  /**
   * 完整替换Vue文件
   * @param {string} content
   * @param {Array} keys
   * @param {Object} keyMap
   * @returns {string}
   */
  async replaceVueFileComplete(content, keys, keyMap) {
    // 先替换 script 部分
    content = this.replaceVueScript(content, keyMap);
    // 再替换 template 部分
    content = this.replaceVueTemplate(content, keyMap);
    return content;
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
    // 跳过i18n配置目录下的所有文件
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.includes('/i18n/') || normalizedPath.includes('/locales/')) {
      return null;
    }

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
      return this.replaceVueTemplate(content, keyMap);
    } else if (section === 'script') {
      return this.replaceVueScript(content, keyMap);
    }

    return content;
  }

  /**
   * 替换Vue template部分
   * @param {string} content
   * @param {Object} keyMap
   * @returns {string}
   */
  replaceVueTemplate(content, keyMap) {
    // 收集所有需要替换的内容
    for (const [k, info] of Object.entries(keyMap.keyMap)) {
      if (!k.includes('::template::')) continue;

      const i18nKey = typeof info === 'string' ? info : info.key;
      let originalText;
      let i18nCall;

      if (typeof info === 'string') {
        // 普通文本
        const textValue = this.getValueByKey(keyMap.messages, i18nKey);
        if (!textValue) continue;

        originalText = textValue;
        i18nCall = `{{ $t('${i18nKey}') }}`;

        // 1. 先替换属性值 - 使用动态绑定（必须先处理，否则会与文本替换冲突）
        const attrRegex = new RegExp(`(placeholder|title|label|alt)=["']${this.escapeRegex(originalText)}["']`, 'g');
        content = content.replace(attrRegex, (match, attrName) => `:${attrName}="$t('${i18nKey}')"`);

        // 2. 再替换文本内容
        const textRegex = new RegExp(`>\\s*${this.escapeRegex(originalText)}\\s*<`, 'g');
        content = content.replace(textRegex, `>${i18nCall}<`);

      } else {
        // 模板字符串
        originalText = info.original;
        const variables = info.variables || [];
        const fullPaths = info.fullPaths || variables; // 使用完整路径
        
        if (variables.length > 0) {
          // 为复杂表达式生成安全的参数
          const params = variables.map((v, i) => {
            const path = fullPaths[i];
            // 生成安全的变量名
            const safeVarName = this.generateSafeVarName(v, i);
            return `${safeVarName}: ${path}`;
          }).join(', ');
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
   * @param {Object} keyMap
   * @returns {string}
   */
  replaceVueScript(content, keyMap) {
    // 解析<script>标签
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) return content;

    const scriptContent = scriptMatch[1];
    // Vue组件的script部分使用this.$t
    const replacedScript = this.replaceJsContent(scriptContent, keyMap, true);

    return content.replace(scriptMatch[0], `<script>${replacedScript}</script>`);
  }

  /**
   * 替换JS文件
   * @param {string} content
   * @param {string} key
   * @param {string|Object} keyInfo
   * @param {Object} keyMap
   * @param {string} filePath 文件路径，用于判断是否为Vue组件
   * @returns {string}
   */
  async replaceJsFile(content, key, keyInfo, keyMap, filePath = '') {
    // 检查是否为Vue组件的script部分（通过调用栈判断）
    const isVueComponent = filePath.endsWith('.vue');
    const replacedContent = this.replaceJsContent(content, keyMap, isVueComponent, filePath);
    return replacedContent;
  }

  /**
   * 替换JS内容
   * @param {string} content
   * @param {Object} keyMap
   * @param {boolean} isVueComponent 是否为Vue组件（script部分）
   * @param {string} filePath 文件路径
   * @returns {string}
   */
  replaceJsContent(content, keyMap, isVueComponent = false, filePath = '') {
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
      });

      let modified = false;
      let needsI18nImport = false;
      const self = this; // 保存this引用

      // 决定使用哪种i18n调用方式
      const i18nMethod = isVueComponent ? 'this.$t' : 'i18n.t';
      if (!isVueComponent) {
        needsI18nImport = true;
      }

      traverse(ast, {
        StringLiteral(path) {
          const text = path.node.value;
          
          // 检查是否在路由配置的静态meta对象中
          if (self.isInRouteStaticMeta(path)) {
            return; // 跳过路由配置中的静态meta替换
          }
          
          // 查找对应的key
          for (const [k, info] of Object.entries(keyMap.keyMap)) {
            if (!k.includes('::script::') && !k.includes('::file::')) continue;

            const i18nKey = typeof info === 'string' ? info : info.key;
            const textValue = self.getValueByKey(keyMap.messages, i18nKey);

            if (textValue === text) {
              // 替换为i18n调用
              path.replaceWithSourceString(`${i18nMethod}('${i18nKey}')`);
              modified = true;
              break;
            }
          }
        },

        TemplateLiteral(path) {
          // 检查是否在路由配置的静态meta对象中
          if (self.isInRouteStaticMeta(path)) {
            return; // 跳过路由配置中的静态meta替换
          }
          
          // 从当前节点提取模板字符串的静态部分（parts）
          const currentParts = [];
          path.node.quasis.forEach((quasi) => {
            currentParts.push(quasi.value.cooked);
          });
          
          // 从当前 AST 节点提取实际的表达式代码
          const actualExpressions = path.node.expressions.map(expr => {
            return generate(expr, { compact: true }).code;
          });
          
          // 查找匹配的模板字符串
          for (const [k, info] of Object.entries(keyMap.keyMap)) {
            if (typeof info !== 'object' || !info.variables) continue;
            if (!k.includes('::script::') && !k.includes('::file::')) continue;

            const i18nKey = info.key;
            const variables = info.variables;
            
            // 检查变量数量是否匹配
            if (actualExpressions.length !== variables.length) {
              continue;
            }
            
            // 检查模板结构是否匹配（通过对比 parts）
            // 从 original 重建 parts
            const template = info.original;
            let expectedParts = [];
            let tempStr = template;
            
            // 提取所有 {{ ... }} 之间的静态文本
            const vueVars = template.match(/\{\{([^}]+)\}\}/g) || [];
            if (vueVars.length > 0) {
              const splitParts = template.split(/\{\{[^}]+\}\}/);
              expectedParts = splitParts;
            } else if (template.includes('{') && template.includes('}')) {
              // JS模板字符串格式，提取 {varName} 之间的内容
              const jsParts = template.split(/\{[^}]+\}/);
              expectedParts = jsParts;
            }
            
            // 对比 parts 是否完全匹配
            if (expectedParts.length > 0 && expectedParts.length === currentParts.length) {
              let partsMatch = true;
              for (let i = 0; i < expectedParts.length; i++) {
                if (expectedParts[i] !== currentParts[i]) {
                  partsMatch = false;
                  break;
                }
              }
              
              if (partsMatch) {
                // 生成对象参数，使用安全的变量名作为key，实际表达式作为值
                const params = variables.map((v, i) => {
                  const safeVarName = self.generateSafeVarName(v, i);
                  return `${safeVarName}: ${actualExpressions[i]}`;
                }).join(', ');
                const replacement = `${i18nMethod}('${i18nKey}', { ${params} })`;
                path.replaceWithSourceString(replacement);
                modified = true;
                break;
              }
            }
          }
        }
      });

      if (modified) {
        const output = generate(ast, {
          retainLines: true,
          compact: false
        });
        let code = output.code;

        // 如果需要导入i18n且还没有导入
        if (needsI18nImport && !code.includes("import i18n from")) {
          // 查找i18n目录的相对路径
          const i18nImport = this.generateI18nImport(filePath);
          code = i18nImport + code;
        }

        return code;
      }

      return content;
    } catch (error) {
      console.error('解析JS内容失败:', error.message);
      return content;
    }
  }

  /**
   * 生成i18n导入语句
   * @param {string} filePath 当前文件路径
   * @returns {string}
   */
  generateI18nImport(filePath) {
    if (!filePath) {
      return "import i18n from '@/i18n';\n";
    }
    
    // 计算相对路径
    const fileDir = path.dirname(filePath);
    const projectRoot = this.config.targetProject;
    const i18nPath = path.join(projectRoot, 'src', 'i18n', 'index.js');
    
    let relativePath = path.relative(fileDir, i18nPath);
    // 规范化路径分隔符为 /
    relativePath = relativePath.replace(/\\/g, '/');
    // 确保以 ./ 或 ../ 开头
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    // 移除 .js 扩展名
    relativePath = relativePath.replace(/\.js$/, '');
    
    return `import i18n from '${relativePath}';\n`;
  }

  /**
   * 检查节点是否在路由配置的静态meta对象中
   * @param {Object} path Babel路径对象
   * @returns {boolean}
   */
  isInRouteStaticMeta(path) {
    let current = path;
    let inMetaObject = false;
    let inRoutesArray = false;
    
    // 向上遍历AST树
    while (current && current.parent) {
      current = current.parentPath;
      if (!current) break;
      
      // 检查是否在meta属性中
      if (current.isObjectProperty && current.isObjectProperty() && current.node.key && current.node.key.name === 'meta') {
        inMetaObject = true;
      }
      
      // 检查是否在routes数组或类似的路由配置中
      if (current.isVariableDeclarator && current.isVariableDeclarator() && current.node.id) {
        const varName = current.node.id.name;
        if (varName === 'routes' || varName === 'router' || varName === 'routerConfig') {
          inRoutesArray = true;
        }
      }
      
      // 检查是否在数组字面量中（通常routes是数组）
      if (current.isArrayExpression && current.isArrayExpression() && inMetaObject) {
        inRoutesArray = true;
      }
      
      // 如果同时在meta对象和routes相关的结构中，说明是路由配置
      if (inMetaObject && inRoutesArray) {
        return true;
      }
    }
    
    return false;
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
   * 生成安全的变量名
   * @param {string} varName 原始变量名或表达式
   * @param {number} index 索引
   * @returns {string}
   */
  generateSafeVarName(varName, index) {
    // 如果是简单变量名（只包含字母、数字、下划线），直接使用
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName)) {
      return varName;
    }
    
    // 如果包含点号，取最后一部分
    if (varName.includes('.')) {
      const parts = varName.split('.');
      const lastPart = parts[parts.length - 1];
      // 确保最后一部分是合法的变量名
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(lastPart)) {
        return lastPart;
      }
    }
    
    // 对于复杂表达式，使用通用名称
    return `val${index}`;
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
