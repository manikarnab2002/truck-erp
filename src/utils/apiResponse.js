export async function readApiResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    return {
      success: response.ok,
      message: response.ok ? "" : `Request failed with status ${response.status}.`,
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: `Server returned an invalid response (${response.status}).`,
      raw: text.slice(0, 200),
    };
  }
}

export async function fetchApiJson(input, options) {
  const response = await fetch(input, options);
  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`);
  }

  return data;
}
