import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type CatalogItem = { code: string; name: string };

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const brand = request.nextUrl.searchParams.get("brand");
  if (brand !== null && !/^\d+$/.test(brand)) {
    return NextResponse.json({ error: "Marca inválida" }, { status: 400 });
  }

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
