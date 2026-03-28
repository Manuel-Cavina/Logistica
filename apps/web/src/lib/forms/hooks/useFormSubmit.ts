"use client";

import { useRef, useState } from "react";

const DEFAULT_SUBMIT_ERROR =
  "No se pudo completar la operacion. Intenta nuevamente en unos segundos.";

export type UseFormSubmitOptions = {
  getErrorMessage?: (error: unknown) => string;
};

export function useFormSubmit<TValues, TResult>(
  submitAction: (values: TValues) => Promise<TResult>,
  options: UseFormSubmitOptions = {},
) {
  const inFlightRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit(values: TValues): Promise<TResult | null> {
    if (inFlightRef.current) {
      return null;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      return await submitAction(values);
    } catch (error) {
      const message = options.getErrorMessage?.(error) ?? DEFAULT_SUBMIT_ERROR;
      setSubmitError(message);
      return null;
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  function resetSubmitError() {
    setSubmitError(null);
  }

  return {
    isSubmitting,
    resetSubmitError,
    submit,
    submitError,
  };
}
