---
title: Robotics Programming
---

Start with simulation, then move to real hardware when you understand the controls and safety limits. This page links to official projects; it does not run a robot or install software on your computer.

## Microduck

Microduck is Pollen Robotics' small open-source biped. Explore its programming and robot-learning stack through the maintainer's pages, rather than an unofficial shop using the same name.

- [Microduck official project](https://pollen-robotics.com/microduck/) — hardware overview and the maintainer's simulator link.
- [Microduck source and setup instructions](https://github.com/pollen-robotics/microduck) — review the README, supported platforms, dependencies and license before installing.
- [NVIDIA: teaching Microduck to walk in simulation](https://developer.nvidia.com/blog/using-ai-agents-to-teach-robots-like-microduck-to-walk-in-simulation/) — an advanced simulation and learning workflow, not a browser-only beginner exercise.

## Hugging Face LeRobot

[LeRobot official documentation](https://huggingface.co/docs/lerobot/) introduces Python-based robot control, demonstration datasets, training and deployment. It is a separate robotics toolkit: do not assume a LeRobot example runs unchanged on Microduck.

## A first learning project

1. Learn basic Python, coordinates, joints, observations and actions.
2. Run the project's supported simulation and observe an existing policy before changing it.
3. Change one parameter at a time, record the result, and compare runs.
4. Follow the maintainer's hardware-specific deployment instructions only when ready.

:::warning Hardware and safety
Check OS/GPU requirements: an Apple Mac is not sufficient for every NVIDIA simulation workflow. Cloud GPU training can cost money. Keep a real robot's motion area clear, use conservative limits and an emergency stop, and have an adult supervise younger learners. Never run unfamiliar motor-control code on real hardware without reviewing it.
:::

Official resources checked October 26, 2026. Features and setup instructions may change.
