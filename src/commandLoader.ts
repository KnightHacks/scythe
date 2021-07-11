import { promises as fs } from 'fs';
import path from 'path';
import Command, { isCommand } from './command';

/**
 * Responsible for dynamic command loading.
 */
export const CommandLoader = {
  /**
   * Dynamically loads commands objects.
   * @param dir The directory to load files from.
   * @returns An array of commands loaded from the given directory.
   */
  async loadCommands(dir: string): Promise<Command[]> {
    // Check if path is directory
    const stats = await fs.lstat(dir).catch((err) => { throw new Error(err); });
    if (!stats.isDirectory()) {
      throw new Error(`${dir} must be a directory.`);
    }

    // Get all files in directory.
    const files = await fs.readdir(dir);

    // Iterate through all of the files in the given dir.
    return Promise.all(files.map(async (file) => {
      // Create the absolute path for import statements.
      const importPath = path.join(dir, file);

      // Dynamically import command file.
      const { default: command }: { default: unknown } = await import(importPath).catch((err) => {
        console.log(err);
        throw new Error(`Could not load command from file: ${file}`);
      });

      // Check if it exported properly.
      if (!command) {
        throw new Error(`${file} does not export a default export of type Command.`);
      }

      // Check if command is valid
      if (!isCommand(command)) {
        throw new Error(`Cannot instantiate from file: ${command}, it doesn't implement the Command interface.`);
      }

      return command;
    }));
  },
};
