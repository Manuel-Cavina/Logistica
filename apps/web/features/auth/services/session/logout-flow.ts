export async function executeLogout(
  logoutRequestFn: () => Promise<void>,
  applyUnauthenticatedStateFn: () => void,
): Promise<void> {
  try {
    await logoutRequestFn();
  } catch (error) {
    console.error("Failed to close the remote session during logout.", error);
  } finally {
    applyUnauthenticatedStateFn();
  }
}
