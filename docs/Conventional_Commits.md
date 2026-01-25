> 参考[Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

## 结构

提交信息由 三部分组成：

1. 标题 (Header)：简洁描述此次更改内容。
2. 正文 (Body)：详细说明更改的背景、原因、以及具体改动（可选）。
3. 页脚 (Footer)：用于补充关联任务或备注信息（如关闭的 issue 编号或重大变更提醒）。

基本格式：

```plain
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### 1. 标题格式

```
<type>(<scope>): <subject>
```

- `type` (必填)：本次提交的更改类型，明确表明变更的性质。
- `scope` (可选)：本次变更影响的范围（模块、功能、文件等）。
- `subject` (必填)：简要描述更改内容，控制在 50 个字符以内，语句开头小写，不加句号。

type 的取值：

- `feat`：新功能（feature）。
- `fix`：修复 bug。
- `docs`：文档相关（如 README、注释）。
- `style`：代码格式化（不影响代码逻辑）。
- `refactor`：代码重构（既不修 bug 也不加功能）。
- `perf`：性能优化。
- `test`：增加或修改测试用例。
- `build`：构建系统或外部依赖相关（如修改 package.json）。
- `ci`：修改 CI 配置或脚本。
- `chore`：不修改代码的杂务（如更改构建流程、配置文件）。
- `revert`：回滚提交。

---

示例：

```
feat(auth): 添加用户登录功能
fix(cart): 修复购物车价格计算错误
docs: 更新 API 文档
style: 格式化代码
refactor(core): 优化数据处理逻辑
```

### 2. 正文格式

正文用于详细说明本次更改的背景和原因，建议包括以下内容：

- 改变的动机（Why）。
- 具体改动内容（What）。
- 改动的影响（Impact）。

书写规范：

- 每行控制在 72 个字符以内。
- 使用英文句子结构（推荐），或者简洁的中文描述。

示例：

```
fix(cart): 修复购物车价格计算错误
- 修复了当购物车有多个商品时，价格计算不正确的问题。
- 原因是数量累加逻辑未考虑浮点数运算的精度。
```

### 3.页脚格式

页脚用于补充重要信息，例如：

- 关闭的 Issue：

```
Closes #123
```

- 重大变更：

```
BREAKING CHANGE: 重命名了用户认证接口 `/auth` 为 `/user/auth`。
```

- 其他备注：

示例：

```
feat(user): 添加用户注册功能

实现了用户通过邮箱注册的功能，并进行了基础验证。
未来将进一步支持手机号注册。

BREAKING CHANGE: 用户模型字段 `username` 已改为 `userName`。
Closes #45
```

### 完整示例

```
feat(auth): 添加用户登录功能

支持通过邮箱和密码登录，并返回 JWT token。
未来版本将支持 OAuth 登录。

BREAKING CHANGE: API 接口 `/api/v1/login` 改为 `/api/v2/auth/login`。
Closes #101
```

## 使用工具强制规范

1. `commitlint`：检查提交信息是否符合规范。
2. `husky`：在提交前（如 pre-commit 或 commit-msg 阶段）自动检查提交信息。

### 配置步骤：

1. 安装依赖：

```bash
yarn add -D @commitlint/config-conventional @commitlint/cli husky
```

2. 创建 commitlint.config.js 文件：

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'types'],
    ],
  },
};
```

3. 启用 husky 钩子：

```bash
yarn husky install
```

创建 commit-msg 钩子文件：

```bash title=".husky/commit-msg"
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
```

然后使脚本可执行：

```bash
chmod +x .husky/commit-msg
```

4. 验证提交信息： 当提交的消息不符合规范时，Git 会报错并中断提交流程。

使用 Angular 提交规范可以提高项目协作的效率，并为版本管理和自动化工具（如 Semantic Release）提供基础支持。

> 也可以使用[simple-git-hooks](https://www.npmjs.com/package/simple-git-hooks)
