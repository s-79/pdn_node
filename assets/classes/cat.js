let db, config

// Le require() envoie une fonction envoyant la class Cat
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Cat
}

let Cat = class {

// ---------------------------------------------------------------------------- ! ! !  - - R E A D - - ! ! !

    // ------------------------------------------------------------------------- Envoyer les données d'une catégorie via son ID
    static getByID(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM categorie WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined)
                        next(result[0])
                    else
                        next(new Error(config.errors.wrongID))
                })
                .catch((err) => next(err))

        })

    }

    // ------------------------------------------------------------------------- Envoyer toutes les catégories
    static getAll() {

        return new Promise((next) => {
            db.query('SELECT * FROM categorie')
                .then((result) => next(result))
                .catch((err) => next(err))
        })
    }

// ---------------------------------------------------------------------------- ! ! !  - - C R E A T E- - ! ! !

    // ------------------------------------------------------------------------- Ajouter une catégorie avec son nom
    static add(nom, icone) {

        return new Promise((next) => {

            if (nom != undefined && nom.trim() != '') {

                nom = nom.trim()

                db.query('SELECT * FROM categorie WHERE nom = ?', [nom])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.nameAlreadyTaken))
                        } else {
                            return db.query('INSERT INTO categorie(nom, icone) VALUES(?,?)', [nom, icone])
                        }
                    })
                    .then(() => {
                        return db.query('SELECT * FROM categorie WHERE nom = ?', [nom])
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

    // ------------------------------------------------------------------------- Modifier les données de la catégorie via son ID
    static update(id, nom, icone) {

        return new Promise((next) => {

            if (nom != undefined && nom.trim() != '') {

                nom = nom.trim()

                db.query('SELECT * FROM categorie WHERE id = ?', [id])
                    .then((result) => {
                        if (result[0] != undefined) {
                            return db.query('SELECT * FROM categorie WHERE nom = ? AND id != ?', [nom, id])
                        } else {
                            next(new Error(config.errors.wrongID))
                        }
                    })
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.sameName))
                        } else {
                            return db.query('UPDATE categorie SET nom = ?, icone = ? WHERE id = ?', [nom, icone, id])
                        }
                    })
                    .then(() => next(true))
                    .catch((err) => next(err))

            } else {
                next(new Error(config.errors.noNameValue))
            }

        })

    }

// ---------------------------------------------------------------------------- ! ! !  - - D E L E T E - - ! ! !

    // ------------------------------------------------------------------------- Supprimer une categorie via son ID
    static delete(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM categorie WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('DELETE FROM categorie WHERE id = ?', [id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))

        })

    }

}
