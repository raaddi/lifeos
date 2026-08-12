# LifeOS

LifeOS to biznesowa aplikacja do organizacji życia: zadania, kalendarz, notatki, przypomnienia, projekty, rutyny i uporządkowane rejestry w jednym miejscu.

Projekt został zbudowany od zera w C# na platformie .NET 10. Nie korzysta z poprzedniego frontendu React ani stylistyki gry.

## Architektura

- `LifeOS.Web` — ASP.NET Core 10 + Blazor Web App (Interactive Server), responsywny frontend i HTTP API.
- `LifeOS.Domain` — model domenowy i reguły biznesowe niezależne od UI oraz bazy danych.
- `LifeOS.Infrastructure` — Entity Framework Core 10, SQLite i implementacja usług aplikacji.
- `LifeOS.Tests` — testy jednostkowe xUnit.

Dane deweloperskie są przechowywane w lokalnej bazie `App_Data/lifeos.db`. Warstwa infrastruktury jest wydzielona, dlatego SQLite można później wymienić na PostgreSQL bez przebudowy interfejsu i domeny.

## Ekosystem

Menu jest zorganizowane według sposobu pracy użytkownika:

- **Dzisiaj** — centrum operacyjne z planem, szybkim zapisem i sygnałami wymagającymi uwagi.
- **Planuj** — zadania, kalendarz, projekty i cele oraz przypomnienia.
- **Organizuj** — notatki oraz arkusze i rejestry przypominające lekkie połączenie Excela z bazą danych.
- **Rozwijaj** — rutyny i obszary życia pokazujące długoterminowy kierunek.

Moduły korzystają ze wspólnych danych. Przykładowo zadanie utworzone dla wybranego obszaru pojawia się w planie dnia, kalendarzu, przypomnieniach, projekcie i rejestrze aktywności.

## Uruchomienie

Wymagany jest .NET SDK 10.

```powershell
dotnet restore LifeOS.sln
dotnet run --project src/LifeOS.Web
```

Aplikacja wypisze lokalny adres HTTPS/HTTP w terminalu. Podstawowy status backendu jest dostępny pod `/api/health`, a stan pulpitu pod `/api/workspace`.

## Sprawdzenie jakości

```powershell
dotnet build LifeOS.sln -c Release
dotnet test LifeOS.sln -c Release
dotnet list LifeOS.sln package --vulnerable --include-transitive
```

## Kontener

```powershell
docker compose up --build
```

Po uruchomieniu kontenera aplikacja jest dostępna pod `http://localhost:8080`, a baza danych znajduje się w trwałym wolumenie `lifeos-data`.

## Najbliższe etapy

1. Logowanie i osobne przestrzenie użytkowników.
2. PostgreSQL dla synchronizacji między komputerem a telefonem.
3. Pełna edycja terminów, projektów, arkuszy i własnych pól użytkownika.
4. Powiadomienia systemowe i instalowalna PWA.
5. Integracje z zewnętrznym kalendarzem oraz pocztą.
