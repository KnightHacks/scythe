import { promises as fs } from 'fs';
import path from 'path';
import { Command, isCommand } from './Command';

/**
 * Dynamically loads commands objects.
 * @param dir The directory to load files from.
 * @param recursive Whether to allow recursive searching or not. Defaults to true.
 * @returns An array of commands loaded from the given directory.
 */
export async function loadCommands(dir: string, recursive = true): Promise<Command[]> {
  const commands: Command[] = [];
  // Check if path is directory
  const stats = await fs.lstat(dir).catch((err) => {
    throw new Error(err);
  });

  if (!stats.isDirectory()) {
    throw new Error(`${dir} must be a directory.`);
  }

  // Get all files in directory.
  const files = await fs.readdir(dir);

  // Loop through each file, (using a for-each because, we need continue statements.)
  for await (const file of files) {
    // Create the absolute path for import statements.
    const importPath = path.join(dir, file);
    const isDirectory = (await fs.lstat(importPath)).isDirectory();

    // Check if directory, if it is, recurse.
    if (isDirectory && recursive) {
      const nestedCommands = await loadCommands(importPath);
      commands.push(...nestedCommands);
      continue;
    }

    if (isDirectory && !recursive) {
      throw new Error('Recursive command loading is disabled, cannot load subdirectories.');
    }

    // Dynamically import command file.
    const { default: command }: { default: unknown } = await import(
      importPath
    ).catch((err) => {
      console.log(err);
      throw new Error(`Could not load command from file: ${file}`);
    });

    // Check if it exported properly.
    if (!command) {
      throw new Error(
        `${file} does not export a default export of type Command.`
      );
    }

    // Check if command is valid
    if (!isCommand(command)) {
      throw new Error(
        `Cannot instantiate from file: ${command}, it doesn't implement the Command interface.`
      );
    }

    commands.push(command);
  }

  return commands;
}
