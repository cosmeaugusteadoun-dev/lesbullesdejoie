// Identifiants du projet Supabase — à remplacer une fois le projet créé.
// La clé "anon" (publique) est faite pour être visible côté client : la
// vraie sécurité est assurée par les policies RLS définies dans
// supabase/schema.sql (lecture publique limitée aux entrées publiées,
// écriture réservée aux comptes connectés). Voir README.md > "Espace admin".
export const SUPABASE_URL = "https://fkjxkomkdavmiylpnocq.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_aTdBey-abPf6cyXLK1BW4A_4iIpUgSg";

export const isSupabaseConfigured =
  !SUPABASE_URL.includes("VOTRE-PROJET") && !SUPABASE_ANON_KEY.includes("VOTRE_CLE");
