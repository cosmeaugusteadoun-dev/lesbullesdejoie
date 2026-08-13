-- =========================================================================
-- Les Bulles de Joie — migration 03
-- À exécuter dans Supabase Dashboard > SQL Editor > New query
-- Ajoute la colonne "content" (texte complet de l'article) à blog_posts,
-- nécessaire pour afficher une vraie page par article ("Lire la suite").
-- Sans effet si la colonne existe déjà.
-- =========================================================================

alter table public.blog_posts add column if not exists content text;

-- Remplit le texte complet des articles d'exemple déjà présents chez vous
-- (sans effet si vous avez renommé/modifié ces titres, ou si content est
-- déjà rempli — le "where content is null" évite d'écraser un texte que
-- vous auriez déjà saisi depuis l'admin).
update public.blog_posts set content = 'La pédagogie Montessori ne s''arrête pas aux portes de la classe. À la maison, quelques ajustements simples suffisent pour prolonger cet esprit d''autonomie et de curiosité que nous cultivons chaque jour aux Bulles de Joie.

La première étape consiste à adapter l''environnement à la taille de l''enfant : une étagère basse avec quelques jeux soigneusement choisis, un porte-manteau à sa hauteur, un marchepied devant le lavabo. Ces petits aménagements permettent à l''enfant de faire seul ce qu''il a envie de faire, sans dépendre systématiquement d''un adulte.

Ensuite, privilégiez la qualité à la quantité : mieux vaut cinq activités que l''enfant peut choisir et ranger lui-même que vingt jouets entassés dans un bac. Les activités de vie pratique — verser de l''eau, plier du linge, préparer une collation — sont d''excellents points de départ, accessibles et valorisantes.

Enfin, laissez du temps. L''enfant a besoin de répéter un geste plusieurs fois pour le maîtriser et en tirer une vraie satisfaction. Résister à l''envie de l''aider trop vite est souvent le plus grand défi... et le plus beau cadeau que l''on puisse lui faire.'
where title = 'La méthode Montessori à la maison' and content is null;

update public.blog_posts set content = 'Le soleil était au rendez-vous pour notre traditionnelle Fête du Printemps, et les enfants n''ont pas boudé leur plaisir ! Toute la matinée a été rythmée par des ateliers en plein air : peinture géante, chasse aux couleurs dans le jardin, et un grand jeu de piste coopératif imaginé par nos enseignants.

Les plus petits ont profité d''un coin sensoriel avec sable, eau et plantations, pendant que les classes de primaire s''affrontaient dans des jeux d''équipe autour de la motricité et de l''entraide plutôt que de la compétition.

Un grand merci aux parents qui ont participé à l''organisation et à la préparation du goûter partagé qui a clôturé cette belle journée. Ces moments de vie collective sont précieux : ils permettent aux enfants de toutes les classes de se retrouver, de coopérer et de partager la joie simple d''une journée ensoleillée entre amis.

Rendez-vous est déjà pris pour l''année prochaine !'
where title = 'Fête du Printemps : Retour en images' and content is null;

update public.blog_posts set content = 'Depuis ce trimestre, notre cantine propose de nouveaux menus élaborés autour de produits bio et, autant que possible, locaux. Cette évolution s''inscrit dans notre volonté d''offrir aux enfants une alimentation saine, qui accompagne leur croissance et leur concentration tout au long de la journée.

Chaque semaine, les menus alternent légumes de saison, céréales complètes et protéines variées, avec une attention particulière portée à la réduction du gaspillage alimentaire. Les portions sont adaptées à l''âge de chaque groupe, de la crèche au primaire.

Nous travaillons également à sensibiliser les enfants au goût et à la provenance des aliments à travers de petits ateliers de découverte : reconnaître un légume, comprendre d''où vient le pain, ou participer à la préparation d''une collation simple. Manger devient ainsi un moment d''apprentissage autant que de plaisir.

Le détail des menus de la semaine est disponible auprès du secrétariat pour toute question ou allergie alimentaire à signaler.'
where title = 'Nouveaux menus bio à la cantine' and content is null;

update public.blog_posts set content = 'Vous hésitez encore sur l''école qui accompagnera votre enfant à la rentrée prochaine ? Notre journée portes ouvertes est l''occasion idéale de venir découvrir Les Bulles de Joie dans une ambiance conviviale et sans engagement.

Au programme : visite libre de nos espaces (crèche, prématernelle, maternelle et primaire), rencontre avec les enseignants de chaque classe, présentation de notre projet pédagogique bilingue, et un temps d''échange convivial pour répondre à toutes vos questions sur les admissions et les tarifs.

Les enfants seront aussi les bienvenus : plusieurs ateliers leur seront proposés pendant que vous échangez avec notre équipe, pour qu''ils se fassent une première idée de l''ambiance de l''école.

Pour connaître la date exacte et vous inscrire, contactez notre secrétariat au 01 97 91 94 52 ou via notre page Contact. Nous avons hâte de vous accueillir !'
where title = 'Portes ouvertes : notez la date !' and content is null;

update public.blog_posts set content = 'Aux Bulles de Joie, toutes nos classes sont bilingues, et la prématernelle est même enseignée exclusivement en anglais. Une question revient souvent chez les parents : n''est-ce pas trop tôt pour le développement du langage de l''enfant ? La recherche est pourtant claire sur ce point : plus l''exposition à une seconde langue commence tôt, plus elle s''intègre naturellement, sans effort de traduction mentale.

Les jeunes enfants disposent d''une plasticité cérébrale exceptionnelle qui leur permet d''absorber plusieurs systèmes linguistiques en parallèle, un peu comme ils apprennent à marcher ou à reconnaître les visages : par imprégnation et répétition, dans un cadre ludique et sécurisant.

Au-delà de la langue elle-même, le bilinguisme précoce stimule des compétences transversales précieuses : la flexibilité cognitive, la capacité à résoudre des problèmes sous plusieurs angles, et une ouverture naturelle à d''autres cultures.

Notre rôle est de créer un environnement où l''anglais et le français sont vécus comme des outils de communication vivants — à travers les chansons, les jeux, les histoires — plutôt que comme une matière scolaire abstraite. C''est ce qui fait, selon nous, toute la différence.'
where title = 'Le bilinguisme précoce, pourquoi ça marche' and content is null;

update public.blog_posts set content = 'Cette année, notre crèche s''est dotée d''une toute nouvelle salle de motricité, pensée spécifiquement pour les besoins des tout-petits de 2 mois à 3 ans. Tapis moelleux, structures à escalader sécurisées, tunnels et parcours d''équilibre : chaque élément a été choisi pour accompagner les grandes étapes du développement moteur, du premier retournement aux premiers pas assurés.

Le mouvement libre est au cœur de notre approche : plutôt que d''installer un enfant dans une posture qu''il n''a pas encore acquise seul, nous préférons lui laisser le temps et l''espace nécessaires pour progresser à son propre rythme, en toute sécurité et sous le regard bienveillant de nos professionnels de la petite enfance.

Cet espace est utilisé quotidiennement, en petits groupes, pour des séances encadrées qui favorisent aussi bien la confiance en soi que la socialisation entre les enfants.

Nous sommes ravis de voir déjà les tout-petits s''y épanouir, rire et progresser un peu plus chaque jour !'
where title = 'Une nouvelle salle de motricité pour les tout-petits' and content is null;
