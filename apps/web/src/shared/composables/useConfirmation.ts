export function useConfirmation() {
  function confirm(message: string): boolean {
    return window.confirm(message);
  }

  function confirmAsync(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(window.confirm(message));
    });
  }

  return { confirm, confirmAsync };
}
