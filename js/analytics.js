/**
 * Enregistre une visite anonyme (chemin de la page + horodatage seulement,
 * aucune IP ni identifiant) dans Supabase, pour le tableau "Statistiques"
 * de l'espace admin. Sans effet si Supabase n'est pas configuré.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

if (isSupabaseConfigured) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  supabase.from("page_views").insert({ page: window.location.pathname }).then(() => {}, () => {});
}
