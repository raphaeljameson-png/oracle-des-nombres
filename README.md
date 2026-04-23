# 🔮 L'Oracle des Nombres

> **Parodie numérologique d'EuroMillions.** Aucune valeur prédictive.

Un site web ridicule qui génère des "prédictions" pour les tirages EuroMillions
à venir, habillées d'un discours pseudo-astrologique et pseudo-scientifique
(phases lunaires, signes du zodiaque, biorythmes, "réseau neuronal quantique v47").

C'est une **blague**. Une satire des vrais sites de numérologie/médiums qui vendent
exactement ce genre de choses sérieusement.

## 🎭 Contenu

- **Page d'accueil** : la prédiction du prochain tirage en grande pompe
- **Calendrier** : les 209 tirages des 2 prochaines années, chacun avec sa prédiction
- **Page "Pourquoi c'est nul"** : l'explication honnête — les tirages EM sont statistiquement
  indistinguables d'un aléatoire parfait (χ² = 53.0 sur 1939 tirages, largement dans l'IC 95%)

## ⚙️ Comment ça marche

Sous le capot c'est 100 lignes de JavaScript :

1. On prend la date du tirage → hash FNV-1a → seed
2. Générateur pseudo-aléatoire Mulberry32 seedé
3. Tirage de 5 numéros (1-50) et 2 étoiles (1-12)
4. Habillage avec du texte astrologique généré depuis des templates

Le résultat est **déterministe** : même date → mêmes numéros. Aucun "refresh"
possible pour tenter sa chance.

## 📦 Structure

```
/
├── index.html         # Page d'accueil (prochain tirage)
├── calendar.html      # Tous les tirages futurs
├── about.html         # Page "pourquoi c'est nul"
├── style.css          # Styles flamboyants (purple/gold)
├── app.js             # Moteur oracle
├── calendar.js        # Données calendrier (injectées via Python)
├── calendar.json      # Calendrier source
├── generate_calendar.py  # Script de régénération
└── LICENSE            # MIT
```

## 🚀 Déploiement

Le site est 100% statique, aucune dépendance, aucun build. Pour le publier sur
GitHub Pages :

1. Dans les settings du repo : **Pages** → **Source: GitHub Actions**
2. Le workflow `.github/workflows/deploy.yml` déploie automatiquement à chaque push sur `main`
3. Le site sera dispo à `https://raphaeljameson-png.github.io/oracle-des-nombres/`

Pour actualiser le calendrier (après 2 ans), relancer :

```bash
python3 generate_calendar.py
python3 -c "import json; d=json.load(open('calendar.json')); open('calendar.js','w').write('window.CALENDAR_DATA = ' + json.dumps(d, separators=(',',':')) + ';\n')"
```

## ⚠️ Avertissements

- **Les jeux d'argent comportent des risques.** Si vous avez un souci :
  **09 74 75 13 13** (Joueurs Info Service) ou [joueurs-info-service.fr](https://www.joueurs-info-service.fr/).
- **Ce site n'a aucune valeur prédictive.** Les tirages EuroMillions sont
  indépendants et uniformément aléatoires. Aucune combinaison n'a plus de chances
  qu'une autre.
- **L'espérance de gain est négative.** Un joueur d'EuroMillions perd en moyenne
  environ 50 centimes sur chaque euro misé. Ce n'est pas un biais corrigeable.

## 🙏 Pourquoi

Parce qu'il existe des vrais sites qui vendent ça sans ironie, et qu'une parodie
bien étiquetée est une bonne façon de les tourner en ridicule tout en rappelant
les faits (tirages aléatoires, espérance négative, où aller si on a un souci).

## 📜 Licence

MIT — fork, modifie, redistribue.

## 🤝 Crédits

Analyse statistique des 1 939 tirages EuroMillions réels basée sur les archives
officielles FDJ. Algorithmes astronomiques approximatifs (précision ~1 jour sur
la phase lunaire). Noms de planètes et signes du zodiaque : tradition astrologique
occidentale. Tout ça mis ensemble de façon parfaitement absurde.
