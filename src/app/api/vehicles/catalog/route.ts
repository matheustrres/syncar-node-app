import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { vehicleCatalogQuerySchema } from "@/lib/vehicle-validation";

type CatalogItem = { code: string; name: string };

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  for (const key of new Set(searchParams.keys())) {
    if (searchParams.getAll(key).length > 1) {
      return NextResponse.json({ error: `Parâmetro repetido: ${key}.` }, { status: 400 });
    }
  }
  const parsedQuery = vehicleCatalogQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsedQuery.success) {
    return NextResponse.json({ error: parsedQuery.error.issues[0]?.message ?? "Parâmetros inválidos." }, { status: 400 });
  }
  const { brand } = parsedQuery.data;

  const path = brand ? `/cars/brands/${brand}/models` : "/cars/brands";
  try {
    const response = await fetch(`https://fipe.parallelum.com.br/api/v2${path}`, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`FIPE: ${response.status}`);

    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("Resposta FIPE inválida");
    const items: CatalogItem[] = data
      .filter((item): item is CatalogItem =>
        typeof item?.code === "string" && typeof item?.name === "string",
      )
      .map(({ code, name }) => ({
        code,
        name: !brand && name === "GM - Chevrolet" ? "Chevrolet" : name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao consultar catálogo FIPE:", error);
    return NextResponse.json(
      { error: "Não foi possível consultar as marcas e modelos agora." },
      { status: 502 },
    );
  }
}
