-- =========================================================================
-- Les Bulles de Joie — migration 08
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Corrige 3 articles de blog déjà publiés qui employaient des termes
-- à éviter (méthode Montessori, Fête du Printemps, menus bio) : nouveau
-- titre, extrait et texte complet.
--
-- Chaque mise à jour cible l'article par son ANCIEN titre exact. Si vous
-- avez déjà modifié l'un de ces articles depuis l'admin (titre différent),
-- la ligne correspondante ne sera pas trouvée — modifiez-le alors
-- directement depuis l'onglet Blog de l'admin.
-- =========================================================================

update public.blog_posts set
  title = 'Cultiver l''autonomie de votre enfant à la maison',
  excerpt = 'Comment prolonger les apprentissages de l''école à la maison avec des activités simples et accessibles, adaptées à chaque âge.',
  content = 'L''autonomie ne s''arrête pas aux portes de la classe. À la maison, quelques ajustements simples suffisent pour prolonger cet esprit d''indépendance et de curiosité que nous cultivons chaque jour aux Bulles de Joie.

La première étape consiste à adapter l''environnement à la taille de l''enfant : une étagère basse avec quelques jeux soigneusement choisis, un porte-manteau à sa hauteur, un marchepied devant le lavabo. Ces petits aménagements permettent à l''enfant de faire seul ce qu''il a envie de faire, sans dépendre systématiquement d''un adulte.

Ensuite, privilégiez la qualité à la quantité : mieux vaut cinq activités que l''enfant peut choisir et ranger lui-même que vingt jouets entassés dans un bac. Les activités de vie pratique — verser de l''eau, plier du linge, préparer une collation — sont d''excellents points de départ, accessibles et valorisantes.

Enfin, laissez du temps. L''enfant a besoin de répéter un geste plusieurs fois pour le maîtriser et en tirer une vraie satisfaction. Résister à l''envie de l''aider trop vite est souvent le plus grand défi... et le plus beau cadeau que l''on puisse lui faire.'
where title = 'La méthode Montessori à la maison';

update public.blog_posts set
  title = 'Journée Récréative : Retour en images',
  excerpt = 'Une journée mémorable remplie de rires, de jeux coopératifs et d''ateliers créatifs en plein air.',
  content = 'Le soleil était au rendez-vous pour notre journée récréative, et les enfants n''ont pas boudé leur plaisir ! Toute la matinée a été rythmée par des ateliers en plein air : peinture géante, chasse aux couleurs dans le jardin, et un grand jeu de piste coopératif imaginé par nos enseignants.

Les plus petits ont profité d''un coin sensoriel avec sable, eau et plantations, pendant que les classes de primaire s''affrontaient dans des jeux d''équipe autour de la motricité et de l''entraide plutôt que de la compétition.

Un grand merci aux parents qui ont participé à l''organisation et à la préparation du goûter partagé qui a clôturé cette belle journée. Ces moments de vie collective sont précieux : ils permettent aux enfants de toutes les classes de se retrouver, de coopérer et de partager la joie simple d''une journée ensoleillée entre amis.

Rendez-vous est déjà pris pour la prochaine édition !'
where title = 'Fête du Printemps : Retour en images';

update public.blog_posts set
  title = 'Notre alimentation, pensée pour les enfants',
  excerpt = 'Notre engagement pour une alimentation saine et équilibrée se renforce.',
  content = 'À la cantine des Bulles de Joie, nous portons une attention particulière à ce qui se retrouve dans l''assiette de vos enfants. Cette année, nos menus ont été retravaillés pour offrir une alimentation saine et équilibrée, pensée pour accompagner leur croissance et leur concentration tout au long de la journée.

Chaque semaine, les menus alternent légumes de saison, céréales complètes et protéines variées, avec une attention particulière portée à la réduction du gaspillage alimentaire. Les portions sont adaptées à l''âge de chaque groupe, de la crèche au primaire.

Nous travaillons également à sensibiliser les enfants au goût et à la provenance des aliments à travers de petits ateliers de découverte : reconnaître un légume, comprendre d''où vient le pain, ou participer à la préparation d''une collation simple. Manger devient ainsi un moment d''apprentissage autant que de plaisir.

Le détail des menus de la semaine est disponible auprès du secrétariat pour toute question ou allergie alimentaire à signaler.'
where title = 'Nouveaux menus bio à la cantine';
