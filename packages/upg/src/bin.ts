#!/usr/bin/env node
/* eslint-disable no-console */
import { Command, program } from "commander";
import { readFile } from "fs/promises";
import { env } from "process";
import { oraPromise } from "ora";

import { SUBSCRIPTION_LOCK, VERSION } from "./globs/shared";
import { AUTH0_CLIENT } from "./globs/node";

import { withErrorFormatting } from "./utils/errorFormatting";
import { error, log, style, success } from "@tsmodule/log";
import { checkSubscription } from "./utils/checkSubscription";

import { loadCommand } from "./commands/load";
import { newCommand } from "./commands/new";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { explainCommand } from "./commands/explain";
import { updateCommand } from "./commands/update";
import { authorizeCommand } from "./commands/authorize";

program
  .name("upg")
  .description("Generate programs for any language or platform.");

program
  .command("new", { isDefault: true })
  .description("Create a new program.")
  .argument("[target]", "The target to generate the script for.\nDefaults to Bash for Linux, ZSH for Mac, and Windows Shell for Windows.")
  .argument("[description]", "A description of the command to generate.")
  .option("-n, --non-interactive", "Run without interactivity.")
  .action(withErrorFormatting(newCommand));

program
  .command("load")
  .description("Load a program from a file.")
  .argument("<file>", "The file to load.")
  .action(withErrorFormatting(loadCommand));

program
  .command("explain")
  .description("Explain a program by pasting it or loading from file.\n\n")
  // .option("-f, --file [file]", "The file to explain.")
  .action(withErrorFormatting(explainCommand));


program
  .command("login")
  .description("Log in to your account.")
  .action(withErrorFormatting(loginCommand));

program
  .command("logout")
  .description("Log out of your account.")
  .action(withErrorFormatting(logoutCommand));

program
  .command("authorize")
  .description("Create a new authorization code to log in via SSH.\n\n")
  .action(withErrorFormatting(authorizeCommand));

program
  .command("update")
  .description("Update the CLI to the latest version.")
  .action(withErrorFormatting(updateCommand));

program
  .command("version")
  .description("Check the current version of UPG.")
  .action(() => {
    log(`UPG version: ${style(VERSION, ["underline"])}.`);
  });

/**
 * Display logo.
 */
const logoFile = new URL("./header.txt", import.meta.url);
const taglinesFile = new URL("./taglines.txt", import.meta.url);

const logo = await readFile(logoFile, "utf8");
const taglines = await readFile(taglinesFile, "utf8").then((data) => data.split("\n"));

if (env.NODE_ENV !== "test") {
  log(
    logo
      .replace(
        "Not competent enough to render a tagline!",
        taglines[Math.floor(Math.random() * taglines.length)]
      )
      .replace(
        "(A version number goes here)",
        VERSION
      ),
    ["dim"]
  );
}

/**
 * Add padding to the help text.
 */
const helpInformation = Command.prototype.helpInformation;
Command.prototype.helpInformation = function () {
  return helpInformation.call(this).replace(/^/gm, "   ") + "\n\n";
};

/**
 * Warn if a user is trying to access non-auth commands without being logged in.
 */
const whitelist = ["help", "--help", "login", "logout", "authorize", "version", "update"];
if (
  env.NODE_ENV !== "test" &&
  !whitelist.includes(process.argv.slice(2)[0])
) {
  const user = await AUTH0_CLIENT.getUser();
  if (!user) {
    error(
      "You are logged out.",
      ["dim"],
      { newlines: 0 }
    );

    error("Run \"upg login\" to log in.");
    process.exit(1);
  }

  // console.log(user);
  success("Logged in.");

  if (SUBSCRIPTION_LOCK) {
    await oraPromise(
      withErrorFormatting(checkSubscription),
      {
        text: "Checking subscription...\n",
        indent: 2,
      }
    );

    log();
  }
}

program.parse(process.argv);