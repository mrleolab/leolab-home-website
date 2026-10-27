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

## 1. Choose a route before installing anything

| Route | Start here | What it does not mean |
| --- | --- | --- |
| Browser discovery | [Pollen Robotics' Microduck Sandbox](https://huggingface.co/spaces/pollen-robotics/microduck-simulator) | A hosted demonstration is not a connection to a physical robot or a local training environment. |
| Microduck runtime and simulation | [Maintainer's simulated-duck guide](https://github.com/pollen-robotics/microduck/blob/main/docs/robot/simulation.md) | A simulator running does not prove that a new policy is safe on real hardware. |
| Microduck policy training | [Microduck RL repository](https://github.com/pollen-robotics/microduck_rl) | The current training quickstart requires a CUDA GPU; Apple Silicon is not CUDA. |
| General robot learning | [LeRobot installation](https://huggingface.co/docs/lerobot/installation) | LeRobot is not a drop-in replacement for Microduck's runtime or training stack. |

For a Mac beginner, start in the browser and read code first. Before local simulation, confirm that the particular simulator supports your OS and processor. Advanced NVIDIA workflows have their own hardware requirements; do not assume every linked tutorial works on macOS. Cloud training is optional and may incur charges.

## 2. Prepare a reproducible learning environment

Learn Python variables, functions, lists and basic terminal navigation. Use a separate environment per project, not your system Python. Before installing, note your Mac model, OS, processor architecture and the project's required Python and dependencies. The [LeRobot compute guide](https://huggingface.co/docs/lerobot/hardware_guide) helps evaluate training hardware; its [installation instructions](https://huggingface.co/docs/lerobot/installation) describe the current environment setup. Requirements change, so record the release/tag or commit you follow.

These inspection commands do not install software or drive motors:

```sh
python3 --version
uname -m
git --version
```

Read the project's setup instructions before running downloaded scripts. Save the environment specification and exact dependency versions with your notes; keep tokens and robot connection details out of public repositories. Do not copy an old install command without checking its project and release.

**Checkpoint:** you can explain which route you chose, what runs in the browser, what would run locally, and whether you need a GPU or hardware.

## 3. First experiment: observe and measure, without a robot

Open the maintainer-linked Sandbox. If it is asleep or unavailable, use the official project's videos and retry later; do not enter account credentials into an unrelated replacement site.

Identify observations (what a controller sees), actions (what it changes), and a policy (how it chooses actions). Try controls actually exposed by the demo; not every hosted version offers parameter editing or training.

Use a small experiment notebook:

| Run | Task | Setting changed | Measurement | Notes |
| --- | --- | --- | --- | --- |
| A | Straight movement | Baseline | Distance reached / falls | Record the starting conditions |
| B | Same task | One available control | Same measurements | Keep other conditions comparable |
| C | Repeat B | No change | Same measurements | Check whether results repeat |

If a setting is not exposed, record observations instead of claiming to have changed it. A useful first result is a short explanation of what improved, what failed, and what remains uncertain—not just a video of motion.

## 4. Move from examples to training

For Microduck, use the separate **Microduck RL** project linked above. Read its hardware requirements and training, evaluation and export sections before starting. Do not begin with long or expensive runs; first understand the provided task and existing policy, then plan a small experiment that fits your budget. Preserve the original policy, configuration, seed, checkpoint and results for comparison.

For a broader learning route, follow [LeRobot's imitation-learning tutorial](https://huggingface.co/docs/lerobot/il_robots) and [simulation-environment guide](https://huggingface.co/docs/lerobot/envhub). Imitation learning uses demonstrations; reinforcement learning improves a policy through interaction and rewards. These are different workflows, not interchangeable commands. Choose a tutorial matching your robot/environment rather than mixing repositories.

**Checkpoint:** before any training, write down the task, success metric, compute budget and stop condition. Exporting a model is not the same as validating safe real-world behavior.

## 5. Real hardware: a separate, supervised step

Use the [Microduck command reference](https://github.com/pollen-robotics/microduck/blob/main/docs/robot/cheatsheet.md) and the robot's own setup guide. Confirm hardware revision, runtime/policy compatibility, calibration, battery condition and supported connection method. Do not apply a command from a different robot just because it has a similar name.

Start with the vendor's known-good behavior in a clear area with conservative limits and a reachable stop method. Back up the working configuration before changes; know the maintainer's recovery procedure. Never upload an experimental policy to a moving robot, leave testing unattended, or put fingers near powered joints. Children need adult supervision.

## 6. Troubleshooting and a shareable project record

| Symptom | What to check before changing anything |
| --- | --- |
| Sandbox will not load | Service status, browser support and network; a hosted service may be asleep. |
| CUDA is unavailable on Mac | The training route needs different hardware; do not try to fix this by installing random CUDA packages on macOS. |
| Python imports or dependencies fail | Active environment, Python version, pinned project release and architecture-specific package support. |
| Simulation works but hardware behaves differently | Stop hardware tests; recheck calibration, policy/runtime compatibility and the maintainer's sim-to-real guidance. |
| LeRobot example rejects Microduck | Verify supported hardware/integration; the two projects are not automatically compatible. |

For help, share the selected project/release, OS/architecture, task, minimal reproduction and a redacted log excerpt. Do not share access tokens, Wi-Fi passwords, private camera footage or complete unreviewed logs.

Keep a README with your goal, official sources, environment, experiment table, result and limitations. Distinguish **observed in a browser**, **tested in local simulation** and **tested on hardware**. This page and its links have been checked as documentation; no local robot training or hardware run was performed for this website update.

## A first learning project

1. Learn basic Python, coordinates, joints, observations and actions.
2. Run the project's supported simulation and observe an existing policy before changing it.
3. Change one parameter at a time, record the result, and compare runs.
4. Follow the maintainer's hardware-specific deployment instructions only when ready.

:::warning Hardware and safety
Check OS/GPU requirements: an Apple Mac is not sufficient for every NVIDIA simulation workflow. Cloud GPU training can cost money. Keep a real robot's motion area clear, use conservative limits and an emergency stop, and have an adult supervise younger learners. Never run unfamiliar motor-control code on real hardware without reviewing it.
:::

Official resources checked October 26, 2026. Features and setup instructions may change.
