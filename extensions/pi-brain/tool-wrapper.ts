/**
 * pi-brain tool wrapper utilities.
 *
 * Policy: if pi-brain overrides a basic pi coding agent tool, it must wrap
 * the tool rather than replace it. The wrapper preserves the original tool's
 * contract and adds brain-specific concerns (citations, capture, sync) as
 * hooks around the base call.
 *
 * See: wiki/brain/adrs/adr-pi-tool-wrapper-override.md
 */

export interface ToolWrapperOptions<T extends (...args: any[]) => any> {
  /** Human-readable name for warning logs. */
  name?: string;
  /** Runs before the base tool; failures are logged, not blocking. */
  before?: (...args: Parameters<T>) => void | Promise<void>;
  /** Runs after the base tool succeeds; failures are logged, not blocking. */
  after?: (result: Awaited<ReturnType<T>>, args: Parameters<T>) => void | Promise<void>;
  /** Runs when the base tool throws; failures are logged, then the original error is re-thrown. */
  onError?: (error: unknown, args: Parameters<T>) => void | Promise<void>;
}

/**
 * Wrap a base pi tool so pi-brain can add behavior without removing capabilities.
 *
 * The base tool is always invoked. Hook failures are never allowed to break
 * the base operation.
 */
export function wrapTool<T extends (...args: any[]) => any>(
  baseTool: T,
  options: ToolWrapperOptions<T>
): T {
  const label = options.name ?? "wrapped-tool";

  return (async (...args: Parameters<T>) => {
    try {
      if (options.before) {
        await options.before(...args);
      }
    } catch (hookError) {
      console.warn(`[pi-brain] before-hook failed for ${label}:`, hookError);
    }

    let result: Awaited<ReturnType<T>>;
    try {
      result = await baseTool(...args);
    } catch (error) {
      try {
        if (options.onError) {
          await options.onError(error, args);
        }
      } catch (hookError) {
        console.warn(`[pi-brain] onError-hook failed for ${label}:`, hookError);
      }
      throw error;
    }

    try {
      if (options.after) {
        await options.after(result, args);
      }
    } catch (hookError) {
      console.warn(`[pi-brain] after-hook failed for ${label}:`, hookError);
    }

    return result;
  }) as T;
}
