-- =========================================================================
-- Les Bulles de Joie — migration 09
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Supprime les 6 articles de démonstration installés par
-- schema.sql lors de la toute première mise en place (avant que vous ne
-- publiiez vos propres articles depuis l'admin). Le site n'insère plus
-- aucun article de démonstration : le blog est désormais entièrement géré
-- depuis l'onglet Blog de l'espace admin.
--
-- Sans effet si vous avez déjà supprimé ces articles vous-même, ou si vous
-- aviez renommé l'un d'eux (il ne sera alors pas trouvé par son titre).
-- =========================================================================

delete from public.blog_posts
where title in (
  'Cultiver l''autonomie de votre enfant à la maison',
  'La méthode Montessori à la maison',
  'Journée Récréative : Retour en images',
  'Fête du Printemps : Retour en images',
  'Notre alimentation, pensée pour les enfants',
  'Nouveaux menus bio à la cantine',
  'Portes ouvertes : notez la date !',
  'Le bilinguisme précoce, pourquoi ça marche',
  'Une nouvelle salle de motricité pour les tout-petits'
);
