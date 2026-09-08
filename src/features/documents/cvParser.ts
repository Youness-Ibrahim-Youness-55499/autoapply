const cvParserUrl = import.meta.env.VITE_CV_PARSER_URL?.trim().replace(/\/$/, "");

type ParseCvInput = {
  accessToken: string;
  documentId: string;
};

export async function parsePdfCv({ accessToken, documentId }: ParseCvInput) {
  if (!cvParserUrl) {
    throw new Error("The CV parser service is not configured.");
  }

  const response = await fetch(`${cvParserUrl}/v1/parse`, {
    body: JSON.stringify({ document_id: documentId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
        ? body.detail
        : `CV parsing failed with status ${response.status}.`;
    throw new Error(message);
  }
}
