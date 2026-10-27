---
title: Minecraft Development on macOS
---

From zero to a first map and a custom game item in **Minecraft: Java Edition** . This is a beginner roadmap with small exercises, not a downloadable finished mod. It is not a Bedrock Add-On or Minecraft Education tutorial.

## 1. Prepare your Mac

- Start with a legitimately licensed copy of [Minecraft: Java Edition](https://www.minecraft.net/en-us/about-minecraft). Download the launcher through Minecraft's own website. Purchases and account setup are yours to complete.
- In **Apple menu → About This Mac** , check whether the Mac uses Apple Silicon or Intel. Choose ARM64/aarch64 software for Apple Silicon, or x64/x86_64 for Intel, when downloads offer both.
- Create a learning folder such as `~/Developer/minecraft-lab`. Keep source projects separate from your normal game saves; back up worlds before experimenting.

## 2. Choose what you want to build

| Route | Use it for | Tools |
| --- | --- | --- |
| Maps and commands | A challenge world, arena, checkpoints or small adventure | Java Edition Creative mode, commands; an editor for notes/scripts |
| Data and resource packs | Version-supported recipes, loot, game data and visual changes | A text editor, JSON and function files |
| Java mods | New registered items and more extensive gameplay behavior | JDK, IntelliJ IDEA or VS Code, Gradle and Fabric |

Read [Minecraft's Java technical release notes](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-11) to understand that pack formats and game data change with versions. That linked article describes a specific historical release, not a recommendation to install it. Fabric is an independent community project, **not Mojang's official mod SDK** .

## 3. Set up Java and an IDE

### Starting baseline: Minecraft 26.1.2 + JDK 25

This guide now uses **Minecraft Java 26.1.2** , **JDK 25** , and the **26.1.2 Fabric documentation** as its starting baseline, not as a claim that this is the newest game release. Use IntelliJ IDEA 2025.3 or newer with a compatible Gradle JVM. These requirements come from the versioned Fabric setup guides; this combination has not been run locally for this tutorial.

Generate a Java project for **26.1.2** and keep the exact Loader, Fabric API, Loom and Gradle-wrapper versions supplied by that template. Record the values in `gradle.properties`, build configuration and `gradle/wrapper/gradle-wrapper.properties` in your README and commit them with the project. Those dependency numbers are project-specific; do not copy a different tutorial's numbers or use dynamic `latest` versions. Use the same versions for your separate play-test profile.

**Before coding:** record your game version, JDK output, IDE version and template dependency values. Changing the game version means reviewing the whole combination, not only changing one number.

1. Pick one Minecraft version supported by the [Fabric development tools](https://fabricmc.net/develop/). Select the same version in Fabric's documentation; keep Minecraft, Loader, Fabric API, mappings and JDK compatible.
2. Follow [Fabric's macOS Java installation guide](https://docs.fabricmc.net/26.1.2/players/installing-java/macos). Install a **JDK** , not just the launcher's runtime. Use the Java version required by your selected toolchain, not an arbitrary latest JDK.
3. Follow [Fabric's environment setup](https://docs.fabricmc.net/26.1.2/develop/getting-started/setting-up). Open Terminal and check:

```sh
java -version
javac -version
/usr/libexec/java_home -V
```

These commands inspect Java installations; they do not install anything. If the IDE and Terminal disagree, check the project's SDK and Gradle JVM settings.

Use [IntelliJ IDEA for macOS](https://www.jetbrains.com/idea/download/?section=mac) as the first route. Follow [Fabric's IDEA setup](https://docs.fabricmc.net/26.1.2/develop/getting-started/intellij-idea/setting-up), including the optional Minecraft Development plugin. VS Code is an alternative, not a requirement to install a second IDE.

**Checkpoint:** the IDE opens your project without a missing-JDK warning.

## 4. Create and run your first project

Use [Fabric's project creation guide](https://docs.fabricmc.net/26.1.2/develop/getting-started/creating-a-project) and template generator. Choose a mod ID such as `leolab`, extract into your learning folder, open the project, and let Gradle synchronize. Review downloaded build scripts before trusting a project.

Follow [Launching the Game](https://docs.fabricmc.net/26.1.2/develop/getting-started/launching-the-game) to run the generated Minecraft client configuration. Use a new disposable world, not an important existing save.

**Checkpoint:** the development client launches and its log shows your mod initializing. This website does not launch Minecraft for you.

## 5. Make a first map

Create a new Creative test world with commands enabled. Design a small three-checkpoint obstacle course: a starting platform, a jump section, and a finish area. Put instructions on signs and play-test each jump.

In empty space in that disposable world, this small command places a 5-by-5 platform one block below your feet, replacing blocks in that area:

```text
/fill ~-2 ~-1 ~-2 ~2 ~-1 ~2 minecraft:stone
```

Relative coordinates (`~`) are measured from your current position. Try `/help fill` and the game's command suggestions before changing the dimensions. Do not test area-changing commands in a treasured world. Keep a backup before each larger edit.

**Checkpoint:** another player can understand the goal and reach the finish without your explanation. Later, learn functions and data packs for repeated map logic; match their format to the exact game release.

## 6. Make a first weapon mod

Before changing an important world, follow the backup steps in section 8 below. A world seed recreates terrain generation, not your buildings, inventory or progress.

Start with [Fabric's first-item tutorial](https://docs.fabricmc.net/26.1.2/develop/items/first-item), then [Tools and Weapons](https://docs.fabricmc.net/26.1.2/develop/items/custom-tools). Implement a simple training sword before attempting projectiles or advanced abilities.

1. Register an item under your mod's namespace, such as `leolab:training_sword`.
2. Add its display name, texture and model resources using the selected version's layout.
3. Follow the weapon tutorial to configure durability, damage and attack speed; a renamed vanilla sword is not a new registered weapon.
4. Restart the development client, obtain the registered item and test it in the disposable world. Check the log if it is missing; check model/resource paths if the texture is missing.

**Checkpoint:** your named sword appears, renders correctly and has the intended in-game behavior. API signatures change: use the version-matched Java examples rather than mixing snippets from unrelated tutorials.

## 7. Build and share safely

Follow [Building a Mod](https://docs.fabricmc.net/26.1.2/develop/getting-started/building-a-mod). From the project directory on macOS, the generated Gradle wrapper normally builds with:

```sh
./gradlew build
```

If macOS reports permission denied, first verify that this is the trusted generated wrapper before granting it execute permission. Find the distribution JAR in `build/libs`, and test a copy with the matching Loader/API in a separate game profile. Share your own mod and source with clear version requirements, not Minecraft's game files, account information or a private world.

## 8. Find, back up and restore a world on macOS

In Finder, use **Go → Go to Folder** (`Command–Shift–G`). The standard launcher's default saves location is:

```text
~/Library/Application Support/minecraft/saves
```

A custom launcher installation uses its own game directory; a Fabric development client normally uses the project's `run/saves`. Check the active profile/run configuration first.

**Back up:** leave the world and quit the client, then ** copy**, not move, the whole world folder to a dated folder outside the game directory. Keep another copy on separate storage. Minecraft's world-selection ** Edit → Make Backup** is another option; consult [Minecraft Backup & Restore](https://help.minecraft.net/hc/en-us/sections/27166561402125).

**Restore safely:** keep the current save untouched. Unzip a copy of the backup and place its world folder under `saves` with a new folder name. The folder should directly contain `level.dat`, not another nested world folder. Relaunch with the same Minecraft version and required mods, verify the copy, and keep both originals. Do not downgrade your only save. See [Minecraft's transfer instructions](https://help.minecraft.net/hc/en-us/articles/360053272471-Transfer-a-Minecraft-Java-Edition-World-to-a-New-Device-).

## 9. Choose and install the correct JAR

The [versioned Fabric build guide](https://docs.fabricmc.net/26.1.2/develop/getting-started/building-a-mod) says to use the shortest-named JAR outside development. For a typical generated project:

| Example output | Purpose |
| --- | --- |
| `leolab-1.0.0.jar` | Distribution mod to test in the game |
| `leolab-1.0.0-sources.jar` | Source archive, not the playable mod |
| A JAR marked `dev` or a development/classifier variant | Development output; do not assume it is the release artifact |

Names vary by project: follow its build configuration if outputs differ. **Do not double-click a mod JAR as an installer.** Copy the distribution JAR into the separate play-test profile's `mods` folder, add the matching Fabric API if required, and launch its Fabric profile. Keep only one copy/version of your mod there. The [Fabric installation guide](https://docs.fabricmc.net/26.1.2/players/installing-mods) lists macOS's default `mods` location; a custom game directory overrides it.

## 10. Troubleshooting checklist

| Symptom | First checks |
| --- | --- |
| Missing `javac`, wrong Java or unsupported class-file version | Compare `java -version`, `javac -version`, project SDK and Gradle JVM against JDK 25. The launcher's Java is not necessarily your IDE's JDK. |
| `gradlew` permission denied | Confirm you are in your own trusted generated project; then grant that wrapper execute permission with `chmod u+x gradlew`. Do not use `sudo` or grant permissions to an unfamiliar script. |
| Dependency download or Gradle sync fails | Read the first useful error. Check network access and template versions, then retry sync; do not randomly delete caches or disable security software. |
| Mod missing or dependency conflict | Check game version, Fabric profile, distribution JAR, required API and duplicate JARs. Forge/NeoForge mods are not Fabric mods. |
| Item exists but has a missing texture | Check lowercase namespace, exact filenames, JSON references and version-specific resource layout; reload/restart as the guide requires. |
| World does not appear | Check active game directory and whether `level.dat` is directly in the world folder; do not replace the only good save. |

For a bug report, collect the game/tool versions, reproduction steps and relevant log excerpt. Logs are often under the active game's `logs/latest.log` or the development project's `run/logs`; redact personal paths, server addresses and any credentials before sharing.

## 11. Official and project documentation index

- **Mojang/Microsoft:** [Minecraft Java overview](https://www.minecraft.net/en-us/about-minecraft) and [world backup help](https://help.minecraft.net/hc/en-us/sections/27166561402125).
- **Fabric project:** [26.1.2 environment setup](https://docs.fabricmc.net/26.1.2/develop/getting-started/setting-up), [first item](https://docs.fabricmc.net/26.1.2/develop/items/first-item), [weapons](https://docs.fabricmc.net/26.1.2/develop/items/custom-tools) and [build a mod](https://docs.fabricmc.net/26.1.2/develop/getting-started/building-a-mod). These are maintainer documentation, not Mojang-authored documentation.

:::note What has been checked
Official Minecraft and project-maintained Fabric links were reviewed October 26, 2026. This documentation page is built and checked as a website; its exercises have not been run inside a local Minecraft installation. Always use your chosen version's current documentation.
:::
