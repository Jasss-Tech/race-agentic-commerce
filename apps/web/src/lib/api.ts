const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const backendError = data?.error;

    const message =
      backendError?.message ||
      data?.message ||
      res.statusText ||
      'API request failed';

    const error = new Error(message);

    (error as any).code =
      backendError?.code ||
      data?.code ||
      'API_REQUEST_FAILED';

    (error as any).message = message;

    (error as any).details =
      backendError?.details ||
      data?.details ||
      null;

    (error as any).error = {
      code:
        backendError?.code ||
        data?.code ||
        'API_REQUEST_FAILED',

      message,

      details:
        backendError?.details ||
        data?.details ||
        null
    };

    (error as any).response = data;
    (error as any).status = res.status;
    (error as any).statusCode = res.status;

    throw error;
  }

  return data as T;
}