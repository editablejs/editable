# 贡献

感谢您对 editable 的改进表示出的兴趣！我们是一个由社区驱动的项目，欢迎各种形式的贡献：从讨论到文档再到修复漏洞和提高功能。

请阅读此文档以帮助简化流程，节省大家宝贵的时间。

## 问题

没有一种软件是无缺陷的。如果您遇到问题，请按照以下步骤操作：

- 查看
  [issue list](https://github.com/editablejs/editable/issues?utf8=%E2%9C%93&q=)
  中查找当前和旧问题。
  - 如果找到现有的问题，请通过添加“赞成”来投票该问题。我们使用这个来帮助优先处理问题！
- 如果上述步骤均无法解决问题，请创建一个问题。

### 复现

帮助找出您遇到的问题的最佳方法是使用我们的 [CodeSandbox](https://codesandbox.io/s/editablejs-323c3x?file=/index.js) 生成一个最小化的重现：

## 开发指南

### 初始设置

#### pnpm

此存储库使用 pnpm workspaces，所以您应该安装 pnpm 作为包管理器。请参阅安装指南。[installation guide](https://pnpm.io/installation).

#### 克隆仓库

```bash
git clone https://github.com/editablejs/editable.git
```

#### 安装和构建

```bash
cd editable
pnpm install
pnpm build
```

### 开发

#### 启动开发服务器

```bash
pnpm dev
```

#### 运行lint

我们使用 eslint 作为所有代码（包括 typescript 代码）

您所要做的就是：

```bash
pnpm lint
```

#### 运行测试

此命令将运行所有的测试

```bash
pnpm test
```

## 发布指南

适用于任何想要发布的人。发布版本顺序如下：

- 提交您的更改：
   - lint、测试、构建应该通过。
- 创建一个从 `main` 分支的 PR 和 [添加变更集](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md)。
- 合并 PR，触发机器人创建 PR 版本。
- 查看最终变更集。
- 合并 PR 版本，触发机器人发布更新 npm 上的包。

## 拉取请求 (PR)

我们欢迎所有贡献。

### 审查 PR

**作为 PR 提交者**，如果有相关的问题，你应该引用它，包括一个简短的描述你所做的贡献，如果是代码变更，还要提供手动测试该变更的说明。这在我们的[PR模板](https://github.com/editablejs/editable/blob/main/.github/PULL_REQUEST_TEMPLATE.md)。中是非正式执行的。如果你的 PR 被审核后只需要进行微小的更改（例如修正拼写错误等），并且你具有提交权限，则可以在进行这些更改后合并该 PR。

**作为 PR 审阅者**，你应该仔细阅读更改并评论任何可能存在的问题。如果你发现一些好东西，一个赞美的话也不会伤害到任何人！此外，你应该遵循测试说明并手动测试更改。如果说明不完整、不清楚或过于复杂，请随时要求提交者提供更好的说明。除非该 PR 是一个草案，如果你批准审查并且没有其他必要的讨论或更改，你也应该继续合并该 PR。

## 问题分类

如果你正在寻找一种帮助项目的方法，问题分类是一个很好的起点。以下是你可以提供帮助的方式：

### 回答问题

[Q&A](https://github.com/editablejs/editable/discussions/categories/q-a) 是一个很好的帮助场所。如果你能回答一个问题，它将帮助提问者以及有类似问题的其他人。并且在将来，如果有人有相同的问题，他们可以通过搜索轻松地找到它。如果一个问题需要复制，你可以引导报告者进行复制，甚至使用 [reproductions](https://github.com/editablejs/editable/blob/main/CONTRIBUTING.md#reproductions) 进行复制。

### 分类问题

一旦你在几个问题上提供了帮助，如果你想要分类访问权限，你可以帮助标记问题并回复报告者。

如果问题是 bug，并且没有明显的复现步骤，您可以将其标记为 `needs reproduction`，并要求作者尝试创建复现步骤，或者您可以自己尝试。

### 关闭问题

- 重复问题应该关闭，并提供指向原始问题的链接。
- 无法复现的问题，如果无法复现，应该关闭（如果报告者掉线，等待 2 周后再关闭是合理的）。
- 当 `bug` 修复并发布时，应该关闭 `bug`。
- 当 `feature`，`maintenance` 发布或如果该功能被认为不合适时，应该关闭。
