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

## 第一个学习项目

1. 学习 Python 基础、坐标、关节、观测与动作。
2. 运行项目支持的仿真，先观察已有策略再修改。
3. 每次只改一个参数，记录结果并比较不同运行。
4. 准备好后再按维护方针对具体硬件的部署说明操作。

:::warning 硬件与安全
先确认系统及 GPU 要求：Apple Mac 不能运行所有 NVIDIA 仿真流程，云端 GPU 训练也可能收费。实机运动区域应保持净空，设置保守限制与急停，低龄学习者须由成人监督。不要未经检查就把陌生电机控制代码运行在实机上。
:::

官方资料核对日期：2026 年 10 月 26 日。功能与配置方式可能变化。
