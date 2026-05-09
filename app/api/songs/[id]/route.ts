export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return Response.json({ message: `Song ${params.id} — coming soon` })
}
