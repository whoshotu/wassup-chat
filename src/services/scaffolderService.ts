// Client for the standalone scaffolder microservice
export async function generateProject(input: Record<string, any>) {
  const url = (import.meta && (import.meta as any).env?.VITE_SCAFFOLDER_URL) || 'http://localhost:4000';
  const tenantId = input?.tenantId || '';
  const payload = {
    ...(input || {}),
    // Auto-detect input language if not provided; allow user to override output language later
    language: input?.language ?? 'auto',
    sample: input?.sample ?? input?.text ?? '',
    tenantId,
  };
  const resp = await fetch(`${url}/generate-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    throw new Error(`Scaffolder service failed with ${resp.status}`);
  }
  const json = await resp.json();
  return json?.data ?? json;
}

export default { generateProject };
