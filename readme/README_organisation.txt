Structure de RGV:
Localisation: e:/Tools/GitHub/RGV

RGV/ 
	ne modifier aucun fichier ni répertoire sauf le répertoire rgv
	contient:
	"setup.py" : permet d'installer tout ce qu'il faut en fonction du fichier "requirements.txt" et crée le fichier "changes.txt"
	"development.ini" : fichier de base pour lancer le serveur via la commande "pserve development.ini";
	                    contient path utilisé,
						utilisateur et administrateur,
						'%(here)' correspond au répertoire contenant development.ini
	"README.md" : instruction pour installer et mettre en place le serveur
	"rgv/" : côté server web, contient toutes les fonctions pour lire fichier, lancer des commandes R, récupérer des données de la BD
		    contient:
			
			"_init.py" : initialise les différentes routes et path dans development.ini
						 récupère certaines variables (nom des DB et utilisateurs)
						 configuration d'elasticSearch, mongodb
						 différentes routes, i.e. les fonctions à appliquer en fonction des adresses webs
						 Attention au nom des routes car il utilise des expressions régulières (utiliser des numéros?)
			"views.py" : contient toutes les fonctions utilisées (bouton pour se connecter, lancer un job, afficher des données de la BD)
						 Créer un fonction en python implique référencement dans le fichier "_init.py"
			"webapp/" : répertoire relatif aux packages web, ne toucher à aucun sous fichier
					   contient:
					   "app" : côté client (juste affichage et ce qui est executé sur le navigateur donc seulement des fonctions (javascript) les plus simples possibles
						       contient :
							   "views/" : contient toutes les fichiers html (views, tels que "about.html", "download.html", "tutorial.html"...)
	         					"index.html" : contient 3 parties: Header, Footer et ng-view
                                               ng-view fait appel aux différentes views (fichiers html présents dans le répertoire "views/")
									           possibilité d'attacher un CSS pour chaque fichier html indépendamment
							   "bower_component/" : composants pour framework (angular)
							   "fonts/" : fonts
							   "images/" : contient images ex logo IRSET, INSERM
							   "scripts/" : contient fichiers javascript
										   contient :
										   "boostrap*.js" : bootstrap est développé par Google et contient du javascript et du css.
										                    Permet d'avoir accès à des outils graphiques uniformes (menu, tableaux, boutons, formulaire)
													        Permet gestion de l'espace de la page web et de la visualiser sur plusieurs supports
										    "jquery.js" : ne pas toucher
											"npm.js" : ne pas toucher (lié à angular)
											"resource.js" : lien entre javascript, view et client, indispensable pour échanger des infos
											                Définis objets tels que Search, User
															Chaque Objet va avoir différentes fonctions associées (ex. User associé à la fonction "register" et "recover" pour enregistrer un utilisateur ou encore retrouver son mot de passe)
															Chaque fonction associée à 4 variables/clefs:
														        - "URL": lié au fichier "_init.py"
																- "method": "POST" ou "GET" pour envoyer ou recevoir
																- "isArray": deux types d'object Array ou Dico (sachant qu'un array est une liste de dico) 
																- "cache": utilise le cache (false par défaut)
															ex fonction "register":
   															    - se réalise sur l'URL "/user/register"
																- dans "_init.py", "/user/register" fait appel à la rote "user_register"
																- dans "views.py", "user_register" est lié à la fonction "user_register" 
											"rgv.js" : Fichier javascript qui gère toutes les fonctions du site web (fonctions clients)
							                           Gère les routes entre les "views" (fichiers html) et l'URL
													   Contient dico avec informations pour décrire que, par exemple "/tutorial" fait appel à la page "views/tutorial.html" 
													   A ça se rajoute des contrôleurs de page: 
													       - 'noCtrl' : pour page texte sans bouton ni interaction avec l'utilisateur
														   - 'appCtrl': contrôleur de base associé avec "/", i.e. le "home" 
													       - URL: 

Pour développer dans RGV, les fichiers les plus importants sont: "resource.js", "rgv.js", "views.py", "_init.py" + les différentes "views" (fichiers html)