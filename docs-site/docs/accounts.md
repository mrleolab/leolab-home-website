---
title: 1. Set up your accounts
---

Keep ownership simple: use accounts you control, verify your email, and know which account owns each project.

## Gmail and Codex

1. If you do not already have Gmail, create an account through [Google's account page](https://accounts.google.com/signup). Configure recovery and two-step verification.
2. Create or sign in to your ChatGPT account at [ChatGPT](https://chatgpt.com/), using your Gmail address or Google sign-in if offered.
3. Follow the [official Codex quickstart](https://learn.chatgpt.com/docs/quickstart) to install the supported desktop experience or choose another supported Codex client.
4. Sign in with your ChatGPT account. Check that you are in the intended workspace and have Codex access.

You are not creating a separate “Codex email account.” Gmail is your email identity; Codex uses your ChatGPT sign-in. An API key is an alternative authentication method for some clients, not a requirement for this tutorial. See [official authentication guidance](https://learn.chatgpt.com/docs/auth).

:::success Checkpoint
You can open Codex, select a project folder, and send a task. You know which account and workspace you are using.
:::

## Create a GitHub account and repository

1. Visit [GitHub signup](https://github.com/signup), choose an account name, and verify your email. Enable two-factor authentication and save recovery codes securely. See [GitHub's account guide](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github).
2. Choose **New repository**. Confirm the **Owner** is your account, then use a name such as `my-first-website`.
3. Choose **Public** if you want to share the code, or **Private** if you do not. A private repository can still publish a public website.
4. Initialize it with a README. Do not select a license without understanding what permissions it grants.
5. Create the repository and copy its URL. Follow [GitHub's repository guide](https://docs.github.com/en/get-started/start-your-journey/creating-a-repository-for-your-project-on-github) if the labels differ.

Clone the repository to your computer with [GitHub Desktop](https://desktop.github.com/), then open that folder in Codex. Alternatively, ask Codex to clone the exact URL if authenticated Git access is available.

:::warning Browser login is not Git permission
Being signed in to GitHub in Chrome does not automatically let a coding tool push commits. Authorize the appropriate GitHub connection or Git client, grant access only to the intended repository, and verify the owner before allowing writes.
:::

:::success Checkpoint
The repository URL belongs to you, and the local folder opened in Codex is a clone of that repository—not an unrelated folder with the same name.
:::
