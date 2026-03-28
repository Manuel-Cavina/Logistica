/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import { useFormSubmit } from "./useFormSubmit";

function createDeferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

describe("useFormSubmit", () => {
  it("prevents double submit while a request is in flight", async () => {
    const deferred = createDeferred<string>();
    const submitAction = jest.fn(() => deferred.promise);
    const { result } = renderHook(() => useFormSubmit(submitAction));

    let firstResultPromise!: Promise<string | null>;

    act(() => {
      firstResultPromise = result.current.submit("first");
    });

    expect(result.current.isSubmitting).toBe(true);

    let secondResult: string | null = "unexpected";

    await act(async () => {
      secondResult = await result.current.submit("second");
    });

    expect(secondResult).toBeNull();
    expect(submitAction).toHaveBeenCalledTimes(1);
    expect(submitAction).toHaveBeenCalledWith("first");

    await act(async () => {
      deferred.resolve("ok");
      await firstResultPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBeNull();
  });

  it("captures async errors and allows resetting the feedback state", async () => {
    const submitAction = jest.fn(async () => {
      throw new Error("network down");
    });
    const { result } = renderHook(() =>
      useFormSubmit(submitAction, {
        getErrorMessage: (error) =>
          error instanceof Error ? `Error inesperado: ${error.message}` : "Error",
      }),
    );

    let submitResult: null = null;

    await act(async () => {
      submitResult = await result.current.submit("payload");
    });

    expect(submitResult).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBe("Error inesperado: network down");

    act(() => {
      result.current.resetSubmitError();
    });

    expect(result.current.submitError).toBeNull();
  });
});
