-- =========================================================================
-- Les Bulles de Joie — migration 10
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Ajoute une photo par élève aux tableaux de félicitations/
-- encouragements/projets de classe (class_recognitions), et supprime la
-- fonctionnalité "Palmarès du personnel" (staff_distinctions), retirée de la
-- page publique "Résultats" et de l'espace admin.
-- =========================================================================

alter table public.class_recognitions add column if not exists photo_url text;

drop table if exists public.staff_distinctions;
