---
title: "AI 与机器学习"
---

了解 AI 概念、负责任的使用方式，以及 AI 服务如何融入应用。新手可以从基础认证开始，再通过官方目录探索工程和基础设施方向。

## 如何选择路线

根据目标平台比较微软 Azure AI Fundamentals 与 AWS Certified AI Practitioner。NVIDIA 目录也提供 AI 和基础设施相关方向。这些是不同认证，不是可以互换的同一场考试。

## 职业认证

- [Microsoft Azure AI Fundamentals](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/)
- [AWS Certified AI Practitioner](https://aws.amazon.com/certification/certified-ai-practitioner/)
- [NVIDIA Certifications](https://www.nvidia.com/en-us/learn/certification/)
- [PyTorch Certified Associate（PTCA）](https://pytorch.org/pytorch-certification/) — Linux Foundation Education 与 PyTorch Foundation 面向早期实践者推出的认证。

## Anthropic、OpenAI 与 Hugging Face

除了云平台认证，也可以学习模型开发、智能体和 AI 实践。注意区分：课程结业证书、完成徽章与职业认证考试不是同一种资质。

| 平台 | 官方入口 | 资源与凭证类型 |
| --- | --- | --- |
| Anthropic | [Claude Academy](https://academy.claude.com/) · [完成徽章常见问题](https://academy.claude.com/help) | 学习 AI 素养与 Claude 使用。Academy 常见问题介绍了通过课程测验获得的完成徽章，具体要求以各课程当前说明为准。 |
| OpenAI | [ChatGPT Learn](https://learn.chatgpt.com/) · [OpenAI Developers](https://developers.openai.com/) | 官方学习与开发资料。这里不将这些入口标为已核实的职业认证，也不承诺完成学习后一定获得证书。 |
| Hugging Face | [Agents Course 证书](https://huggingface.co/learn/agents-course/en/unit4/get-your-certificate) · [Audio Course 结业证书](https://huggingface.co/learn/audio-course/en/chapter8/certification) | 特定课程的证书，各有测验或项目要求，不等同于通用的 Hugging Face 职业认证。 |
| PyTorch | [官方教程](https://pytorch.org/tutorials/) · [PTCA 认证](https://pytorch.org/pytorch-certification/) | 先学习张量与神经网络开发，再独立核对职业认证要求。 |

## AI 基础设施：vLLM 与 SGLang

这两项属于技术学习路线，不是已核实的认证项目。截至 **2026 年 10 月 26 日**，在本次查阅的项目官方资源中尚未确认个人认证项目。第三方培训的结业证明不应称作这些开源项目颁发的官方认证。

- [vLLM 官方文档](https://docs.vllm.ai/en/latest/) — 学习模型服务、批处理、显存使用与性能基准测试。
- [SGLang 官方文档](https://docs.sglang.io/) — 学习大语言模型和多模态推理服务、前缀缓存与分布式推理。

可以用两个框架部署同一个小模型，记录硬件、模型版本、延迟、吞吐量与显存使用，作为作品集实验。请先查看硬件要求：推理实验可能需要 GPU 或付费云计算。不要把未设身份验证的模型服务直接暴露到公网。

## 建议学习顺序

1. 从 AI 基础概念以及 Claude 或 OpenAI 的入门学习资料开始。
2. 完成 Hugging Face 课程项目，核对相应证书要求。
3. 用 PyTorch 构建并解释一个小模型；需要正式资质时再考虑 PTCA。
4. 准备学习推理基础设施时，再进入 vLLM 或 SGLang。

## 开始实践

做一个小实验，说明它的局限和使用的数据。再阅读官方能力大纲，列出自己还解释不清的概念。

:::note 报名前核对
认证名称、考试版本、费用、资格与续证政策可能变化，以认证机构当前文档为准。课程结业证明或徽章不一定等同于职业认证。
:::
