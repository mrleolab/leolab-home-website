---
title: 机器人编程
---

先从仿真开始，理解控制方式与安全限制后再接触实机。本页提供官方学习入口，不会直接控制机器人或在电脑安装软件。

## Microduck

Microduck 是 Pollen Robotics 的小型开源双足机器人。请通过维护方页面了解编程与机器人学习，不要把同名非官方商店当成项目官网。

- [Microduck 官方项目](https://pollen-robotics.com/microduck/) — 硬件介绍与维护方提供的仿真入口。
- [Microduck 源码与配置说明](https://github.com/pollen-robotics/microduck) — 安装前阅读 README、支持平台、依赖与许可证。
- [NVIDIA：在仿真中教 Microduck 行走](https://developer.nvidia.com/blog/using-ai-agents-to-teach-robots-like-microduck-to-walk-in-simulation/) — 进阶仿真与学习流程，并非纯浏览器新手练习。

## Hugging Face LeRobot

[LeRobot 官方文档](https://huggingface.co/docs/lerobot/) 介绍 Python 机器人控制、示范数据集、训练与部署。它是另一套机器人工具，不要假定 LeRobot 示例可直接原样运行在 Microduck 上。

## 1. 安装前先选学习路线

| 路线 | 官方起点 | 不代表什么 |
| --- | --- | --- |
| 浏览器体验 | [Pollen Robotics 的 Microduck Sandbox](https://huggingface.co/spaces/pollen-robotics/microduck-simulator) | 托管演示不等于连接实机，也不是本地训练环境。 |
| Microduck 运行系统与仿真 | [维护方的仿真机器人指南](https://github.com/pollen-robotics/microduck/blob/main/docs/robot/simulation.md) | 仿真能跑，不代表新策略已能安全用于实机。 |
| Microduck 策略训练 | [Microduck RL 仓库](https://github.com/pollen-robotics/microduck_rl) | 当前训练 quickstart 要求 CUDA GPU；Apple Silicon 不是 CUDA。 |
| 通用机器人学习 | [LeRobot 安装指南](https://huggingface.co/docs/lerobot/installation) | LeRobot 不能直接替代 Microduck 的运行和训练系统。 |

Mac 新手先用浏览器并阅读代码。本地仿真前，核对具体仿真器是否支持自己的系统与芯片。进阶 NVIDIA 流程另有硬件要求，不要假定所有链接都支持 macOS。云端训练是可选项，可能收费。

## 2. 准备可复现的学习环境

先掌握 Python 变量、函数、列表与终端目录操作。每个项目使用独立环境，不要修改系统 Python。安装前记录 Mac 型号、系统、芯片架构与项目要求的 Python、依赖。[LeRobot 计算硬件指南](https://huggingface.co/docs/lerobot/hardware_guide)帮助评估训练设备，[安装说明](https://huggingface.co/docs/lerobot/installation)介绍当前环境配置。要求会变化，请记录采用的发布版本、标签或提交号。

以下检查命令不安装软件，也不驱动电机：

```sh
python3 --version
uname -m
git --version
```

运行下载脚本前先读项目说明。把环境配置与精确依赖版本保存在学习笔记中，不要把访问令牌和机器人连接资料提交到公开仓库。不要不看项目与版本就照抄旧安装命令。

**检查点：** 能说清选择了哪条路线，什么在浏览器运行、什么需要本地运行，以及是否需要 GPU 或实机。

## 3. 第一个实验：没有机器人也能观察与测量

打开维护方提供的 Sandbox。如果休眠或不可用，可以先看官方项目视频再重试，不要在不相关的替代网站输入账号凭据。

理解观测（控制器看到什么）、动作（改变什么）、策略（如何决定动作）。只使用演示真正提供的控件，不是每个托管版本都支持改参数或训练。

建立一个简单实验记录：

| 运行 | 任务 | 改动 | 测量 | 备注 |
| --- | --- | --- | --- | --- |
| A | 直线运动 | 基线 | 到达距离、跌倒次数 | 记录起始条件 |
| B | 同一任务 | 一个可用控件 | 同样的测量 | 其他条件尽量相同 |
| C | 重复 B | 不变 | 同样的测量 | 检查结果能否重复 |

如果某个参数没有开放，就记录观察，不要声称已经修改。第一个有用的成果是解释哪里改善、哪里失败、还有什么不确定，而不只是一段运动视频。

## 4. 从示例走向训练

Microduck 使用上面单独链接的 **Microduck RL** 项目。开始前阅读硬件要求、训练、评估与导出章节。不要直接启动长时间或高费用任务；先理解现有任务和策略，再规划预算内的小实验。保留原始策略、配置、随机种子、检查点与结果，便于比较。

更通用的路线可以参考 [LeRobot 模仿学习教程](https://huggingface.co/docs/lerobot/il_robots)与[仿真环境指南](https://huggingface.co/docs/lerobot/envhub)。模仿学习从示范中学习，强化学习通过交互与奖励优化策略，两者不是可以混用命令的同一流程。选择适合具体机器人和环境的教程，不要拼接不同仓库的步骤。

**检查点：** 训练前写明任务、成功标准、计算预算与停止条件。模型能导出，不等于已经验证实机安全。

## 5. 实机是独立的受监督步骤

使用 [Microduck 命令参考](https://github.com/pollen-robotics/microduck/blob/main/docs/robot/cheatsheet.md)及机器人本身的配置说明。确认硬件版本、运行系统与策略兼容性、校准、电池状况及支持的连接方式。不要仅凭名称相似，就把别的机器人的命令用于它。

先用厂商已知正常的行为，在净空区域设置保守限制，并准备可立即触发的停止方式。修改前备份正常配置，了解维护方的恢复方法。不要向正在运动的机器人上传实验策略，不要无人看管测试，也不要把手指靠近通电关节。儿童须由成人监督。

## 6. 常见问题与可分享的项目记录

| 现象 | 修改前先检查 |
| --- | --- |
| Sandbox 无法加载 | 服务状态、浏览器支持与网络，托管服务可能休眠。 |
| Mac 没有 CUDA | 该训练路线需要其他硬件，不要靠在 macOS 随意安装 CUDA 包解决。 |
| Python 导入或依赖失败 | 当前环境、Python 版本、固定的项目版本及对应架构的软件包支持。 |
| 仿真正常但实机异常 | 先停止实机测试，再检查校准、策略与运行系统兼容性和维护方 sim-to-real 指南。 |
| LeRobot 示例不接受 Microduck | 检查是否有对应硬件支持与集成，两套项目不会自动兼容。 |

求助时提供项目与版本、系统和架构、任务、最小复现步骤及脱敏日志片段。不要分享访问令牌、Wi-Fi 密码、私人摄像头画面或未经检查的完整日志。

README 应包括目标、官方来源、环境、实验记录、结果与局限，并明确区分**浏览器观察** 、**本地仿真测试** 、**实机测试** 。本次只验证文档网页与链接，没有为网站更新执行本地机器人训练或实机运行。

## 第一个学习项目

1. 学习 Python 基础、坐标、关节、观测与动作。
2. 运行项目支持的仿真，先观察已有策略再修改。
3. 每次只改一个参数，记录结果并比较不同运行。
4. 准备好后再按维护方针对具体硬件的部署说明操作。

:::warning 硬件与安全
先确认系统及 GPU 要求：Apple Mac 不能运行所有 NVIDIA 仿真流程，云端 GPU 训练也可能收费。实机运动区域应保持净空，设置保守限制与急停，低龄学习者须由成人监督。不要未经检查就把陌生电机控制代码运行在实机上。
:::

官方资料核对日期：2026 年 10 月 26 日。功能与配置方式可能变化。
