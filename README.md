# Popis projektu

Projekt se zaměřuje na vývoj API služby pro správu hesel, která umožní bezpečné ukládání, zobrazení, úpravu a sdílení hesel mezi jednotlivci i skupinami uživatelů. Projekt bude zahrnovat návrh a implementaci celé služby včetně základního frontendu pro interakci uživatelů.

# Klíčové funkce  

- **Ukládání hesel:** Uživatelé mohou bezpečně ukládat svá hesla. Každé heslo bude šifrováno před uložením v databázi pomocí šifrovacího algoritmu.  
- **Zobrazení hesel:** Jednotliví uživatelé mohou zobrazit své uložené hesla, či hesla v rámci skupiny, pro které mají práva.
- **Tvorba a úprava hesel:** Uživatelé mohou přidávat nová hesla, upravovat existující, nebo je mazat.  
- **Sdílení hesel:** Uživatelé mohou vytvářet skupiny a sdílet v nich vybraná hesla s dalšími členy. Každý člen bude mít přidělené pravomoci (např. pouze čtení, nebo čtení i editace). 
- **Audit přístupu:** Systém bude zaznamenávat, kdo a kdy přistoupil k jednotlivým heslům, což zajistí přehled o aktivitách ve skupinách.  

# Využití  

Správce hesel má široké využití jak pro jednotlivce, tak pro týmy či firmy.  
Pro jednotlivce slouží k bezpečnému ukládání a správě hesel na osobní úrovni. 
Pro týmy poskytuje snadný způsob, jak sdílet přístupové údaje například k týmovým účtům nebo firemním systémům, a to s možností detailní kontroly nad tím, kdo má k heslům přístup, co s nimi může dělat a kdy s nimi a jakým způsobem zacházel.  

# Entity

## Uživatel

Tato entita reprezentuje jednotlivého uživatele systému a jeho interakci s API.  
- **Atributy:**  
  - `user_id` (serial, primární klíč) – jedinečný identifikátor uživatele
  - `username` (text, unique, not null) – uživatelské jméno
  - `password` (text, not null) – uživatelské heslo

## Skupina 

Tato entita umožňuje vytváření skupin, ve kterých mohou uživatelé sdílet hesla. 
- **Atributy:**
  - `group_id` (serial, primární klíč) – jedinečný identifikátor skupiny
  - `name` (text, unique, not null) – název skupiny

## Vazba mezi uživatelem a skupinou
- **Atributy:**
  - `group_id` (int, cizí klíč na `group(group_id)`, on delete cascade) – id skupiny
  - `user_id` (int, cizí klíč na `user(user_id)`, on delete cascade) – id uživatele
  - primární klíč: (`group_id`, `user_id`)

## Heslo

Entita hesla slouží k ukládání a správě přístupových údajů jednotlivých uživatelů nebo skupin.  
- **Atributy:**  
  - `password_id` (serial, primární klíč) – jedinečný identifikátor hesla
  - `description` (text, not null) – popis nebo url související s heslem
  - `group_id` (int, cizí klíč na `group(group_id)`, on delete cascade) – id skupiny, které heslo patří
  - `username` (text, not null) – uživatelské jméno pro přihlášení
  - `password` (text, not null) – uživatelské heslo pro přihlášení

## Log

Tato entita zajišťuje zaznamenávání všech akcí, které proběhnou v systému.  
- **Atributy:**
  - `log_id` (serial, primární klíč) – jedinečný identifikátor záznamu
  - `date` (timestamp, not null) – datum a čas akce
  - `group_id` (int, cizí klíč na `group(group_id)`, on delete set null) – skupina, které se záznam týká
  - `description` (text, not null) – popis akce