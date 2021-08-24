import { promises as fs } from 'fs';
import path from 'path';

export type TypeGuard<T> = (type: unknown) => type is T;

export async function loadStructures<T>(
  dir: string,
  typeChecker: TypeGuard<T>,
  recursive = true
): Promise<T[]> {
  const structures: T[] = [];

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
      const nestedCommands = await loadStructures(importPath, typeChecker);
      structures.push(...nestedCommands);
      continue;
    }

    if (isDirectory && !recursive) {
      throw new Error('Recursive structure loading is disabled, cannot load subdirectories.');
    }

    if (!importPath.endsWith('.ts') && !importPath.endsWith('.js')) {
      continue;
    }

    // Dynamically import command file.
    const { default: structure }: { default: unknown } = await import(importPath).catch((err) => {
      console.log(err);
      throw new Error(`Could not load structure from file: ${file}`);
    });

    // Check if it exported properly.
    if (!structure) {
      throw new Error(`${file} does not export a default export.`);
    }

    // Run Type checks.
    if (!typeChecker(structure)) {
      throw new Error(
        `Cannot load structure at file: ${file}, because it doesn't conform to a proper type.`
      );
    }

    structures.push(structure);
  }

  return structures;
}
