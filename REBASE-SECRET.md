# Retirer le secret de l’historique Git (commit c0b55157)

Le fichier `api-java/docker-compose.yml` est déjà corrigé (variables d’environnement).  
GitHub refuse encore le push car l’**ancien** commit `c0b55157` contient la clé dans l’historique.  
Il faut réécrire l’historique pour corriger ce commit.

## Étapes (à faire dans l’ordre)

### 1. Lancer le rebase interactif

```powershell
cd c:\Users\jerom\Desktop\JeroKa\test-sh\back-office
git rebase -i c0b55157^
```

(Le `^` signifie « le parent du commit c0b55157 ».)

### 2. Modifier la première ligne

Un éditeur s’ouvre avec des lignes du type :

```
pick c0b55157 Refactor Docker configurations...
pick 353f75d7 fix: remove secrets from docker-compose...
```

- Sur la **première ligne**, remplace **`pick`** par **`edit`** pour le commit `c0b55157`.
- Enregistre et ferme l’éditeur (sauvegarder puis quitter).

### 3. Une fois que Git s’arrête sur le commit c0b55157

Git indique que tu es en train d’éditer ce commit. Exécute ces commandes **dans l’ordre** :

```powershell
git checkout main -- api-java/docker-compose.yml
git add api-java/docker-compose.yml
git commit --amend --no-edit
git rebase --continue
```

(Cela remplace le fichier par la version sans secret qui est sur `main`. Si Git demande « main n’existe pas », utilise à la place : `git checkout 353f75d7 -- api-java/docker-compose.yml`.)

Si un éditeur s’ouvre pour le message de commit, enregistre et ferme pour continuer.

### 4. En cas de conflits

Si `git rebase --continue` signale des conflits :

- Ouvre les fichiers concernés, corrige les conflits.
- Puis :
  ```powershell
  git add .
  git rebase --continue
  ```
- Répète jusqu’à ce que le rebase soit terminé.

### 5. Pousser l’historique réécrit

```powershell
git push --force-with-lease origin main
```

---

Ensuite, garde bien tes clés uniquement dans le `.env` (jamais dans le dépôt).
