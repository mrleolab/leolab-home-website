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

### 起步基线：Minecraft 26.1.2 + JDK 25

本教程以 **Minecraft Java 26.1.2** 、**JDK 25** 和 ** 26.1.2 版 Fabric 文档**作为起步基线，不表示这是最新游戏版本。IntelliJ IDEA 使用 2025.3 或更新版本，并配置兼容的 Gradle JVM。这些要求来自对应版本的 Fabric 配置指南；本教程尚未本地运行这套组合。

为 **26.1.2** 生成 Java 项目，保留模板给出的 Loader、Fabric API、Loom 和 Gradle wrapper 精确版本。把 `gradle.properties`、构建配置和 `gradle/wrapper/gradle-wrapper.properties` 中的值记录到 README，并随源码提交。这些依赖版本与项目有关，不要混用其他教程的数字，也不要用动态 `latest`。独立试玩配置也使用同一组版本。

**编码前检查：** 记录游戏版本、JDK 输出、IDE 版本及模板依赖值。更换游戏版本时要检查整套组合，不能只改一个数字。

1. 从 [Fabric 开发入口](https://fabricmc.net/develop/)选择支持的 Minecraft 版本，文档选择相同版本。Minecraft、Loader、Fabric API、映射与 JDK 必须相互兼容。
2. 参考 [Fabric 的 macOS Java 安装指南](https://docs.fabricmc.net/26.1.2/players/installing-java/macos)，安装 **JDK** ，不能只依赖启动器自带运行环境。按所选工具链要求安装，不要随便选最新版本。
3. 参考 [开发环境配置](https://docs.fabricmc.net/26.1.2/develop/getting-started/setting-up)，在“终端”检查：

```sh
java -version
javac -version
/usr/libexec/java_home -V
```

这些命令仅查看 Java 安装，不安装软件。如果终端与 IDE 显示不一致，检查项目 SDK 与 Gradle JVM 设置。

第一条路线使用 [macOS 版 IntelliJ IDEA](https://www.jetbrains.com/idea/download/?section=mac)，按照 [Fabric 的 IDEA 配置指南](https://docs.fabricmc.net/26.1.2/develop/getting-started/intellij-idea/setting-up) 操作，可选装 Minecraft Development 插件。VS Code 是替代方案，不需要同时安装两个 IDE。

**检查点：** IDE 能打开项目，不出现缺少 JDK 的警告。

## 4. 创建并运行第一个项目

按照 [Fabric 项目创建指南](https://docs.fabricmc.net/26.1.2/develop/getting-started/creating-a-project)使用模板生成器。模组 ID 可用 `leolab`，解压到学习目录，打开项目并等待 Gradle 同步。信任项目之前检查下载的构建脚本。

按照 [启动游戏指南](https://docs.fabricmc.net/26.1.2/develop/getting-started/launching-the-game)运行生成的客户端配置。新建可丢弃的测试世界，不要使用重要存档。

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

修改重要世界前，先按第 8 节备份。世界种子只能重新生成地形，不会恢复你的建筑、背包与游戏进度。

先做 [Fabric 第一件物品教程](https://docs.fabricmc.net/26.1.2/develop/items/first-item)，再看 [工具与武器教程](https://docs.fabricmc.net/26.1.2/develop/items/custom-tools)。先制作简单的练习剑，再尝试投射物或复杂技能。

1. 在自己模组命名空间注册物品，例如 `leolab:training_sword`。
2. 按所选版本的目录规则添加名称、贴图与模型资源。
3. 按武器教程设置耐久、伤害与攻击速度；把原版剑改名不等于注册新武器。
4. 重启开发客户端，在测试世界获取物品并试玩。物品找不到先查日志，贴图缺失先查模型和资源路径。

**检查点：** 练习剑名称、外观和游戏行为符合设计。API 会变化，Java 示例必须使用版本匹配的官方项目文档，不要混用不同年代教程。

## 7. 构建与安全分享

参考 [构建模组指南](https://docs.fabricmc.net/26.1.2/develop/getting-started/building-a-mod)。在 macOS 的项目目录，生成的 Gradle wrapper 通常使用：

```sh
./gradlew build
```

如果提示没有执行权限，先确认脚本是可信模板生成的 wrapper，再授予执行权限。在 `build/libs` 找到发布 JAR，复制到独立游戏配置中，配合匹配的 Loader/API 测试。分享自己的模组与源码，注明版本要求；不要分发 Minecraft 游戏文件、账号资料或私人世界。

## 8. 在 macOS 查找、备份与恢复世界

在 Finder 使用 **前往 → 前往文件夹** （`Command–Shift–G`）。标准启动器默认存档位置为：

```text
~/Library/Application Support/minecraft/saves
```

自定义启动配置使用自己的游戏目录；Fabric 开发客户端通常使用项目里的 `run/saves`。先核对当前启动配置或运行配置。

**备份：** 退出世界并关闭客户端，把完整世界文件夹**复制** 到游戏目录外带日期的文件夹，不要移动原件；再保留一份独立存储副本。游戏世界选择界面的 **编辑 → 创建备份** 也是一种方式，参见 [Minecraft 备份与恢复帮助](https://help.minecraft.net/hc/en-us/sections/27166561402125)。

**安全恢复：** 保留当前存档不动。解压备份副本，把世界文件夹用新文件夹名放入 `saves`；文件夹内应直接有 `level.dat`，不要多套一层。用相同游戏版本及所需模组启动，验证副本后继续保留原件。不要降级打开唯一存档。参见 [Minecraft 世界转移说明](https://help.minecraft.net/hc/en-us/articles/360053272471-Transfer-a-Minecraft-Java-Edition-World-to-a-New-Device-)。

## 9. 选择并安装正确的 JAR

[对应版本的 Fabric 构建指南](https://docs.fabricmc.net/26.1.2/develop/getting-started/building-a-mod)说明，开发环境以外使用文件名最短的 JAR。典型生成项目可能有：

| 输出示例 | 用途 |
| --- | --- |
| `leolab-1.0.0.jar` | 用于游戏测试的发布模组 |
| `leolab-1.0.0-sources.jar` | 源码归档，不是可玩的模组 |
| 标有 `dev` 或开发用途后缀的 JAR | 开发产物，不应直接认定为发布文件 |

文件名因项目而异，输出不同请看具体构建配置。**不要双击模组 JAR 当安装程序运行。** 把发布 JAR 复制到独立试玩配置的 `mods` 文件夹，按需加入兼容 Fabric API，再启动对应 Fabric 配置。同一模组只保留一个版本。[Fabric 安装指南](https://docs.fabricmc.net/26.1.2/players/installing-mods)列出 macOS 默认 `mods` 路径，自定义游戏目录则以该配置为准。

## 10. 常见问题排查

| 现象 | 优先检查 |
| --- | --- |
| 找不到 `javac`、Java 版本不对或 class-file 版本错误 | 比较 `java -version`、`javac -version`、项目 SDK 与 Gradle JVM，确认 JDK 25；启动器 Java 不一定等于 IDE 的 JDK。 |
| `gradlew` 没有执行权限 | 确认当前目录是自己可信的模板项目，再用 `chmod u+x gradlew` 仅给该 wrapper 执行权限。不要用 `sudo`，不要给陌生脚本授权。 |
| 依赖下载或 Gradle 同步失败 | 阅读第一条有用错误，检查网络与模板版本后重试；不要盲目清空缓存或关闭安全软件。 |
| 找不到模组或依赖冲突 | 检查游戏版本、Fabric 启动配置、发布 JAR、所需 API 与重复 JAR。Forge/NeoForge 模组不是 Fabric 模组。 |
| 物品存在但没有贴图 | 检查小写命名空间、文件名、JSON 引用与版本对应的资源目录，按指南重载或重启。 |
| 找不到世界 | 检查当前游戏目录及 `level.dat` 是否直接位于世界文件夹内，不要覆盖唯一正常存档。 |

报告问题时准备游戏与工具版本、复现步骤、相关日志片段。日志通常在当前游戏目录的 `logs/latest.log` 或开发项目的 `run/logs`；分享前遮去个人路径、服务器地址与任何凭据。

## 11. 官方与项目文档索引

- **Mojang/Microsoft：** [Minecraft Java 介绍](https://www.minecraft.net/en-us/about-minecraft)、[世界备份帮助](https://help.minecraft.net/hc/en-us/sections/27166561402125)。
- **Fabric 项目：** [26.1.2 环境配置](https://docs.fabricmc.net/26.1.2/develop/getting-started/setting-up)、[第一件物品](https://docs.fabricmc.net/26.1.2/develop/items/first-item)、[武器](https://docs.fabricmc.net/26.1.2/develop/items/custom-tools)、[构建模组](https://docs.fabricmc.net/26.1.2/develop/getting-started/building-a-mod)。这些是维护方文档，不是 Mojang 编写的官方文档。

:::note 已验证范围
Minecraft 官方及 Fabric 项目维护方链接于 2026 年 10 月 26 日核对。本教程已作为网页构建与检查，但尚未在本地 Minecraft 客户端执行这些练习。请始终参考所选版本的当前文档。
:::
