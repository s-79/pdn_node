let db, config

// Le require() envoie une fonction envoyant la class Them
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Them
}

let Them = class {

// ---------------------------------------------------------------------------- ! ! !  - - R E A D - - ! ! !

    // ------------------------------------------------------------------------- Envoyer les données d'une thématique via son ID
    static getByID(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM v_cat_them WHERE id_thematique = ?', [id])
                .then((result) => {
                    if (result[0] != undefined)
                        next(result[0])
                    else
                        next(new Error(config.errors.wrongID))
                })
                .catch((err) => next(err))

        })

    }

    // ------------------------------------------------------------------------- Envoyer toutes les thématiques
    static getAll() {

        return new Promise((next) => {
            db.query('SELECT * FROM v_cat_them ORDER BY nom_thematique')
                .then((result) => next(result))
                .catch((err) => next(err))
        })
    }

// ---------------------------------------------------------------------------- ! ! !  - - C R E A T E- - ! ! !

    // ------------------------------------------------------------------------- Ajouter une thématique avec son nom
    static add(nom, categorie) {

        return new Promise((next) => {

            if (nom != undefined && nom.trim() != '') {

                nom = nom.trim()

                db.query('SELECT * FROM thematique WHERE nom = ?', [nom])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.nameAlreadyTaken))
                        } else {
                            return db.query('INSERT INTO thematique(nom, id_categorie) VALUES(?,?)', [nom, categorie])
                        }
                    })
                    .then(() => {
                        return db.query('SELECT * FROM thematique WHERE nom = ?', [nom])
                    })
                    .then((result) => {
                        next({
                            id: result[0].id,
                            nom: result[0].nom
                        })
                    })
                    .catch((err) => next(err))

            } else {
                next(new Error(config.errors.noNameValue))
            }

        })

    }

// ---------------------------------------------------------------------------- ! ! !  - - U P D A T E - - ! ! !

    // ------------------------------------------------------------------------- Modifier le nom de la thématique via son ID
    static updateNom(id, nom) {
        return new Promise((next) => {
            db.query('SELECT * FROM thematique WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('UPDATE thematique SET nom = ? WHERE id = ?', [nom, id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))
        })
    }

    // ------------------------------------------------------------------------- Modifier la catégorie de la thématique via son ID
    static updateCat(id, categorie) {
        return new Promise((next) => {
            db.query('SELECT * FROM thematique WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('UPDATE thematique SET id_categorie = ? WHERE id = ?', [categorie, id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))
        })
    }

// ---------------------------------------------------------------------------- ! ! !  - - D E L E T E - - ! ! !

    // ------------------------------------------------------------------------- Supprimer une thematique via son ID
    static delete(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM thematique WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('DELETE FROM thematique WHERE id = ?', [id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))

        })

    }

}
