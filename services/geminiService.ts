
// This file now acts as a client to our OWN backend API endpoints.
// It no longer needs the @google/genai SDK or an API key.

async function callApi<T>(endpoint: string, content: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function summarizeNote(content: string): Promise<string> {
  if (!content.trim()) {
    return 'Note is empty.';
  }
  try {
    const data = await callApi<{ summary: string }>('/api/summarize', content);
    return data.summary;
  } catch (error) {
    console.error("Error summarizing note:", error);
    throw new Error("Failed to generate summary from the backend.");
  }
}

export async function suggestTags(content: string): Promise<string[]> {
   if (!content.trim()) {
    return [];
  }
  try {
    const data = await callApi<{ tags: string[] }>('/api/tags', content);
    return data.tags || [];
  } catch (error) {
    console.error("Error suggesting tags:", error);
    throw new Error("Failed to generate tags from the backend.");
  }
}

export async function extractActionItems(content: string): Promise<string[]> {
   if (!content.trim()) {
    return [];
  }
  try {
    const data = await callApi<{ action_items: string[] }>('/api/actions', content);
    return data.action_items || [];
  } catch (error) {
    console.error("Error extracting action items:", error);
    throw new Error("Failed to extract action items from the backend.");
  }
}
