---
title: macOS 上的 Minecraft 开发
---

从零开始，为 **Minecraft Java 版** 制作第一张地图与自定义游戏物品。这是入门路线与小练习，不是可直接下载的完整模组，也不是基岩版附加包或 Minecraft Education 教程。

## 1. 准备 Mac

- 准备合法授权的 [Minecraft Java 版](https://www.minecraft.net/en-us/about-minecraft)，从 Minecraft 官网下载启动器。购买与账号注册由你自行完成。
- 在 **苹果菜单 → 关于本机** 查看 Apple Silicon 或 Intel 芯片。下载时，Apple Silicon 对应 ARM64/aarch64，Intel 对应 x64/x86_64。
- 创建如 `~/Developer/minecraft-lab` 的学习文件夹。源码项目与日常游戏存档分开，实验前备份世界。

## 2. 选择开发路线

| 路线 | 适合做什么 | 工具 |
| --- | --- | --- |
| 地图与命令 | 挑战地图、竞技场、检查点、小冒险 | Java 版创造模式、命令，编辑器记录脚本 |
| 数据包与资源包 | 当前版本支持的配方、战利品、游戏数据及外观修改 | 文本编辑器、JSON、函数文件 |
| Java 模组 | 注册新物品、更深入的玩法行为 | JDK、IntelliJ IDEA 或 VS Code、Gradle、Fabric |

通过 [Minecraft Java 技术更新说明](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-11) 了解数据格式随版本变化。链接介绍的是某一历史版本，不是建议安装该版本。Fabric 是独立社区项目，**不是 Mojang 官方模组 SDK** 。

## 3. 安装 Java 与 IDE

1. 从 [Fabric 开发入口](https://fabricmc.net/develop/)选择支持的 Minecraft 版本，文档选择相同版本。Minecraft、Loader、Fabric API、映射与 JDK 必须相互兼容。
2. 参考 [Fabric 的 macOS Java 安装指南](https://docs.fabricmc.net/players/installing-java/macos)，安装 **JDK** ，不能只依赖启动器自带运行环境。按所选工具链要求安装，不要随便选最新版本。
3. 参考 [开发环境配置](https://docs.fabricmc.net/develop/getting-started/setting-up)，在“终端”检查：

```sh
java -version
javac -version
/usr/libexec/java_home -V
```

这些命令仅查看 Java 安装，不安装软件。如果终端与 IDE 显示不一致，检查项目 SDK 与 Gradle JVM 设置。

第一条路线使用 [macOS 版 IntelliJ IDEA](https://www.jetbrains.com/idea/download/?section=mac)，按照 [Fabric 的 IDEA 配置指南](https://docs.fabricmc.net/develop/getting-started/intellij-idea/setting-up) 操作，可选装 Minecraft Development 插件。VS Code 是替代方案，不需要同时安装两个 IDE。

**检查点：** IDE 能打开项目，不出现缺少 JDK 的警告。

## 4. 创建并运行第一个项目

按照 [Fabric 项目创建指南](https://docs.fabricmc.net/develop/getting-started/creating-a-project)使用模板生成器。模组 ID 可用 `leolab`，解压到学习目录，打开项目并等待 Gradle 同步。信任项目之前检查下载的构建脚本。

按照 [启动游戏指南](https://docs.fabricmc.net/develop/getting-started/launching-the-game)运行生成的客户端配置。新建可丢弃的测试世界，不要使用重要存档。

**检查点：** 开发客户端能启动，日志显示模组初始化。本网站不会替你启动 Minecraft。

## 5. 制作第一张地图

新建允许命令的创造模式测试世界，设计三个检查点的小型跑酷地图：起点平台、跳跃区、终点。用告示牌说明规则，逐段试玩。

在可丢弃世界的空地输入下面命令，会在脚下一格放置 5×5 石头平台，替换该区域原有方块：

```text
/fill ~-2 ~-1 ~-2 ~2 ~-1 ~2 minecraft:stone
```

`~` 表示相对当前位置的坐标。修改尺寸前先看 `/help fill` 和游戏内命令提示。不要在珍贵存档尝试区域修改命令；每次较大修改前保留备份。

**检查点：** 其他玩家不用你解释，也能理解目标并抵达终点。之后再学习函数与数据包来重复执行地图逻辑，格式须匹配具体游戏版本。

## 6. 制作第一件武器模组

先做 [Fabric 第一件物品教程](https://docs.fabricmc.net/develop/items/first-item)，再看 [工具与武器教程](https://docs.fabricmc.net/develop/items/custom-tools)。先制作简单的练习剑，再尝试投射物或复杂技能。

1. 在自己模组命名空间注册物品，例如 `leolab:training_sword`。
2. 按所选版本的目录规则添加名称、贴图与模型资源。
3. 按武器教程设置耐久、伤害与攻击速度；把原版剑改名不等于注册新武器。
4. 重启开发客户端，在测试世界获取物品并试玩。物品找不到先查日志，贴图缺失先查模型和资源路径。

**检查点：** 练习剑名称、外观和游戏行为符合设计。API 会变化，Java 示例必须使用版本匹配的官方项目文档，不要混用不同年代教程。

## 7. 构建与安全分享

参考 [构建模组指南](https://docs.fabricmc.net/develop/getting-started/building-a-mod)。在 macOS 的项目目录，生成的 Gradle wrapper 通常使用：

```sh
./gradlew build
```

如果提示没有执行权限，先确认脚本是可信模板生成的 wrapper，再授予执行权限。在 `build/libs` 找到发布 JAR，复制到独立游戏配置中，配合匹配的 Loader/API 测试。分享自己的模组与源码，注明版本要求；不要分发 Minecraft 游戏文件、账号资料或私人世界。

:::note 已验证范围
Minecraft 官方及 Fabric 项目维护方链接于 2026 年 10 月 26 日核对。本教程已作为网页构建与检查，但尚未在本地 Minecraft 客户端执行这些练习。请始终参考所选版本的当前文档。
:::
