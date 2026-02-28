import { NextRequest, NextResponse } from "next/server";

/**
 * API для поиска компании по ИНН через DaData
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const inn = searchParams.get("inn");

  if (!inn) {
    return NextResponse.json(
      { error: "ИНН не указан" },
      { status: 400 }
    );
  }

  const dadataToken = process.env.DADATA_TOKEN || process.env.DADATA_API_KEY;

  if (!dadataToken) {
    return NextResponse.json(
      { error: "DADATA_TOKEN не настроен" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${dadataToken}`,
      },
      body: JSON.stringify({ query: inn }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Ошибка при запросе к DaData" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.suggestions || data.suggestions.length === 0) {
      return NextResponse.json(
        { error: "Компания не найдена" },
        { status: 404 }
      );
    }

    const company = data.suggestions[0];
    const partyData = company.data;

    return NextResponse.json({
      inn: partyData.inn,
      kpp: partyData.kpp,
      name: company.value,
      shortName: partyData.name.short_with_opf,
      fullName: partyData.name.full_with_opf,
      address: company.data.address.value,
      legalAddress: partyData.address.value,
      status: partyData.state.status,
      ogrn: partyData.ogrn,
    });
  } catch (error) {
    console.error("Ошибка при поиске компании:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
